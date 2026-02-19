import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class LlmService {
  private readonly model;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  }

  async request(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const raw = result.response.text();

      // Gemini часто возвращает JSON внутри тройных кавычек — чистим
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : raw;

      return JSON.parse(jsonText);
    } catch (err) {
      console.error('Error analyzing text:', err);
      throw new InternalServerErrorException('Gemini request failed.');
    }
  }
}
