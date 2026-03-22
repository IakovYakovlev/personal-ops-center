import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly model;
  private readonly embeddingModelName =
    process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-001';
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  }

  async request(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const raw = result.response.text();

      // Gemini часто возвращает JSON внутри тройных кавычек — чистим
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : raw;

      // Валидируем что это корректный JSON
      if (typeof jsonText === 'string') {
        JSON.parse(jsonText);
      }

      return jsonText;
    } catch (err) {
      console.error('Error analyzing text:', err);
      throw new InternalServerErrorException('Gemini request failed.');
    }
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
      }

      const embeddingModel = this.genAI.getGenerativeModel({
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
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Error creating embedding:', message);
      throw new InternalServerErrorException(`embedding creation failed: ${message}`);
    }
  }

  async createEmbeddingMultiple(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.createEmbedding(text)));
  }
}
