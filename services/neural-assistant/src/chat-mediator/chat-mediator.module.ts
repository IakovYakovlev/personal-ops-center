import { Module } from '@nestjs/common';
import { ChatMediatorService } from './chat-mediator.service';
import { EmbeddingModule } from 'src/embedding/embedding.module';

@Module({
  imports: [EmbeddingModule],
  providers: [ChatMediatorService],
})
export class ChatMediatorModule {}
