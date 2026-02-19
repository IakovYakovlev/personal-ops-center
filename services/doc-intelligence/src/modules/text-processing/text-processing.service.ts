import { Inject, Injectable } from '@nestjs/common';
import { LlmService } from 'src/modules/llm/llm.service';
import pLimit from 'p-limit';
import Redis from 'ioredis';

@Injectable()
export class TextProcessingService {
  private readonly CHUNK_SIZE = Number(process.env.CHUNK_SIZE) || 50000;
  private readonly MERGE_BATCH_SIZE = Number(process.env.MERGE_BATCH_SIZE) || 10;

  constructor(
    private readonly llm: LlmService,
    @Inject('REDIS') private readonly redis: Redis,
  ) {}

  async processAsync(text: string, jobId: string): Promise<string> {
    if (text.length <= this.CHUNK_SIZE) return this.analyzeText(text);

    const limit = pLimit(3);
    const chunks = this.splitIntoChunks(text);
    console.log(`Splitting text into ${chunks.length} chunks`);
    const response: string[] = await Promise.all(
      chunks.map((chunk, index) =>
        limit(async () => {
          const cacheKey = `job:${jobId}:chunk:${index}`;
          console.log(`Caching: ${cacheKey}`);

          // Проверяем кеш
          const cached = await this.redis.get(cacheKey);
          if (cached) return cached;

          // Если нет - обрабатываем
          const result = await this.analyzeText(chunk);

          // Сохраняем результат
          await this.redis.set(cacheKey, result, 'EX', 60 * 10); // 10 минут

          return result;
        }),
      ),
    );

    const result = await this.mergeResultsHierarchical(response);

    // Чистим кэш
    await this.clearChunkCache(jobId, chunks.length);

    return result;
  }

  private async mergeResultsHierarchical(results: string[]): Promise<string> {
    let current = results;
    const mergeLimit = pLimit(3);

    while (current.length > 1) {
      current = await Promise.all(
        Array.from({ length: Math.ceil(current.length / this.MERGE_BATCH_SIZE) }, (_, index) =>
          mergeLimit(async () => {
            const start = index * this.MERGE_BATCH_SIZE;
            const group = current.slice(start, start + this.MERGE_BATCH_SIZE);
            return this.mergeResults(group);
          }),
        ),
      );
    }

    console.log(`-->> Completed merging.`);
    return current[0];
  }

  private async analyzeText(text: string) {
    const prompt = `
      Analyze the following text and return a JSON object with:
      - summary
      - keywords
      - sentiment (positive/negative/neutral)
      - main topics
      - insights

      Respond ONLY in valid JSON format.

      Text:
      """${text}"""
    `;

    // await new Promise((r) => setTimeout(r, 5000)); // ждём 5 сек

    return await this.llm.request(prompt);
  }

  private async mergeResults(results: string[]) {
    if (!results || results.length === 0) {
      return '';
    }

    if (results.length === 1) {
      return results[0];
    }

    const mergePrompt = `
      You are an AI assistant. The following are analysis results in valid JSON format from different sections of the same document.

      Each section is a JSON object with:
      - summary
      - keywords
      - sentiment
      - main topics
      - insights
      
      Your task:
      - Merge information from all JSON sections
      - Remove duplicates
      - Keep structure consistent
      - Return ONLY valid JSON
      - No additional text, no explanations, no apologies
      
      Sections JSON:
      ${results.map((r, i) => `// Section ${i + 1}\n${r}`).join('\n\n')}
      
      Return the final combined JSON.
    `.trim();
    return await this.llm.request(mergePrompt);
  }

  private async clearChunkCache(jobId: string, chunkCount: number) {
    const pipeline = this.redis.pipeline(); // Оптимизация — одна транзакция Redis
    for (let i = 0; i < chunkCount; i++) {
      pipeline.del(`job:${jobId}:chunk:${i}`);
    }
    await pipeline.exec();
  }

  private splitIntoChunks(text: string): string[] {
    const result: string[] = [];
    for (let i = 0; i < text.length; i += this.CHUNK_SIZE) {
      result.push(text.substring(i, i + this.CHUNK_SIZE));
    }

    return result;
  }
}
