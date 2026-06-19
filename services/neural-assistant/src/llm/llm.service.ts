import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly model;
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  }

  async request(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const raw = result.response.text();

      if (typeof raw !== 'string' || raw.trim().length === 0) {
        throw new Error('Empty response from Gemini');
      }

      // Remove optional markdown code fences while preserving plain text responses.
      const cleaned = raw
        .replace(/^```(?:json|text)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      return cleaned;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Gemini request failed: ${message}`);
      throw new InternalServerErrorException(`Gemini request failed: ${message}`);
    }
  }
}
