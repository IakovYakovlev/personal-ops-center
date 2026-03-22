import { TextProcessingService } from 'src/modules/text-processing/text-processing.service';
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import pLimit from 'p-limit';
import { EmbeddingService } from '../embedding/embedding.service';

@Injectable()
export class JobsProcessor {
  private readonly redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });
  private worker: Worker;

  constructor(
    private readonly textProcessing: TextProcessingService,
    private readonly embeddingService: EmbeddingService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      'processing',
      async (job) => {
        const { text, userId, plan, documentId } = job.data;

        // Обновляем статус в Redis
        await this.redis.set(
          `job:${job.id}`,
          JSON.stringify({ status: 'processing', userId, plan, documentId }),
          'EX',
          60 * 30,
        );

        try {
          const result = await this.textProcessing.processAsync(text, job.id as string);

          // Разбиваем документ на чанки для RAG
          const chunks = this.splitIntoChunks(text, 1000);

          // получаем embeddings для каждого чанка
          const limit = pLimit(2);

          const chunkEmbeddings = await Promise.all(
            chunks.map((chunkText, index) =>
              limit(async () => {
                const embedding = await this.embeddingService.embed(chunkText);

                return {
                  chunkIndex: index,
                  content: chunkText,
                  embedding,
                };
              }),
            ),
          );

          // Записываем документ и чанки в транзакции
          await this.prisma.$transaction(async (tx) => {
            // Сохраняем или обновляем документ
            await tx.document.upsert({
              where: { id: documentId },
              create: {
                id: documentId,
                userId,
                status: 'ready',
                chunksCount: chunkEmbeddings.length,
              },
              update: {
                status: 'ready',
                chunksCount: chunkEmbeddings.length,
              },
            });

            // Удаляем старые чанки (если было переобработано)
            await tx.documentChunk.deleteMany({
              where: { documentId },
            });

            // Сохраняем новые чанки
            await tx.documentChunk.createMany({
              data: chunkEmbeddings.map((chunk) => ({
                documentId,
                chunkIndex: chunk.chunkIndex,
                content: chunk.content,
                embedding: chunk.embedding,
                model: process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-001',
                metadata: {},
              })),
            });

            // Обновляем статус задания
            await tx.job.update({
              where: { id: job.id as string },
              data: {
                status: 'completed',
                documentId,
                chunksSaved: chunkEmbeddings.length,
                result: this.safeJsonParse(result),
              },
            });
          });

          // Удаляем временные данные из Redis
          await this.redis.del(`job:${job.id}`);

          return result;
        } catch (err) {
          await this.prisma.job.update({
            where: { id: job.id as string },
            data: {
              status: 'failed',
              error: String(err),
            },
          });

          // В Redis оставляем статус "failed" (но с TTL)
          await this.redis.set(
            `job:${job.id}`,
            JSON.stringify({ status: 'failed', userId, plan }),
            'EX',
            60 * 30,
          );

          throw err;
        }
      },
      {
        connection: this.redis,
      },
    );
  }

  private splitIntoChunks(text: string, chunkSize: number): string[] {
    const normalized = text.replace(/\s+/g, ' ').trim();

    if (!normalized) {
      return [];
    }

    const chunks: string[] = [];

    for (let i = 0; i < normalized.length; i += chunkSize) {
      chunks.push(normalized.slice(i, i + chunkSize));
    }

    return chunks;
  }

  private safeJsonParse(value: any): any {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
    }
    this.redis.disconnect();
  }
}
