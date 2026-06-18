import { Injectable } from '@nestjs/common';
import { EmbeddingService } from 'src/embedding/embedding.service';

@Injectable()
export class ChatMediatorService {
  constructor(private readonly embeddingService: EmbeddingService) {}

  async sendMessage(message: string): Promise<void> {
    // получить embedding
    const embedding: number[] = await this.embeddingService.createEmbedding(message);

    // retrieval
    // собрать prompt
    // вызвать LLM
    // сохранить ответ
    // вернуть DTO
  }
}
