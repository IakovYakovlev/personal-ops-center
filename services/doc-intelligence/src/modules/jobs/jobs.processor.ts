import { TextProcessingService } from 'src/modules/text-processing/text-processing.service';
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JobsProcessor {
  private readonly redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });
  private worker: Worker;

  constructor(
    private readonly textProcessing: TextProcessingService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      'processing',
      async (job) => {
        const { text, userId, plan } = job.data;

        // Обновляем статус в Redis
        await this.redis.set(
          `job:${job.id}`,
          JSON.stringify({ status: 'processing', userId, plan }),
        );

        try {
          const result = await this.textProcessing.processAsync(text, job.id as string);

          // Записываем итог в PostgreSQL
          await this.prisma.job.update({
            where: { id: job.id as string },
            data: {
              status: 'completed',
              result,
            },
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
}
