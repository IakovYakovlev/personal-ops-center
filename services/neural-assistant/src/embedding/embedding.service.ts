import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly genAi: GoogleGenerativeAI;
  private readonly embeddingModelName =
    process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-001';

  constructor() {
    this.genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
      }

      const embeddingModel = this.genAi.getGenerativeModel({
        model: this.embeddingModelName,
      });

      const result = await embeddingModel.embedContent(text);
      const embedding = result.embedding?.values;

      if (!embedding || !Array.isArray(embedding)) {
        throw new Error('Invalid embedding response: expected array of numbers');
      }

      this.logger.debug(
        `Generated embedding for text of ${text.length} characters with model ${this.embeddingModelName}`,
      );

      return embedding;
    } catch (error) {
      this.logger.error('Error creating embedding:', error);
      throw new InternalServerErrorException(`embedding creation failed: ${error.message}`);
    }
  }
}
