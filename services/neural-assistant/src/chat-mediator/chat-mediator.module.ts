import { forwardRef, Module } from '@nestjs/common';
import { ChatMediatorService } from './chat-mediator.service';
import { EmbeddingModule } from 'src/embedding/embedding.module';
import { DockIntelligenceClientModule } from 'src/dock-intelligence-client/dock-intelligence-client.module';
import { PromptBuilderModule } from 'src/prompt-builder/prompt-builder.module';
import { LlmModule } from 'src/llm/llm.module';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [
    EmbeddingModule,
    DockIntelligenceClientModule,
    PromptBuilderModule,
    LlmModule,
    forwardRef(() => ChatModule),
  ],
  providers: [ChatMediatorService, PrismaService],
  exports: [ChatMediatorService],
})
export class ChatMediatorModule {}
