import { Module } from '@nestjs/common';
import { ChatMediatorService } from './chat-mediator.service';
import { EmbeddingModule } from 'src/embedding/embedding.module';
import { DockIntelligenceClientModule } from 'src/dock-intelligence-client/dock-intelligence-client.module';

@Module({
  imports: [EmbeddingModule, DockIntelligenceClientModule],
  providers: [ChatMediatorService],
})
export class ChatMediatorModule {}
