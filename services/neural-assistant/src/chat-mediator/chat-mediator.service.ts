import { Injectable } from '@nestjs/common';
import { DockIntelligenceClientService } from 'src/dock-intelligence-client/dock-intelligence-client.service';
import { RetrievedChunk } from 'src/dock-intelligence-client/dtos/retrieved-chunk.dto';
import { EmbeddingService } from 'src/embedding/embedding.service';

@Injectable()
export class ChatMediatorService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly dockIntelligenceClientService: DockIntelligenceClientService,
  ) {}

  async sendMessage(
    message: string,
    documentId: string,
    authorizationHeader?: string,
  ): Promise<void> {
    // получить embedding
    const embedding: number[] = await this.embeddingService.createEmbedding(message);

    // retrieval
    const relevantChunks: RetrievedChunk[] =
      await this.dockIntelligenceClientService.findRelevantChunks(
        embedding,
        documentId,
        authorizationHeader,
      );

    // собрать prompt
    // вызвать LLM
    // сохранить ответ
    // вернуть DTO
  }
}
