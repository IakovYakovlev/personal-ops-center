import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(private readonly llm: LlmService) {}

  /**
   * Converts a text chunk into a vector (embedding).
   * Returns an array of numbers (the embedding vector).
   */
  async embed(text: string): Promise<number[]> {
    try {
      // Отправляешь текст в LLM с запросом на embedding
      // Твой LlmService должен иметь метод createEmbedding или аналог
      const embedding = await this.llm.createEmbedding(text);

      // LLM должен вернуть массив чисел
      if (!Array.isArray(embedding)) {
        throw new Error('Invalid embedding response: expected array of numbers');
      }

      return embedding;
    } catch (err) {
      this.logger.error(`Failed to embed text: ${err}`);
      throw err;
    }
  }

  /**
   * Converts multiple text chunks into vectors.
   * For demo, just maps embed() over each chunk sequentially.
   */
  async embedMultiple(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.embed(text)));
  }
}
