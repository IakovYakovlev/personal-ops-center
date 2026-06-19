import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatMediatorModule } from 'src/chat-mediator/chat-mediator.module';

@Module({
  imports: [AuthModule, forwardRef(() => ChatMediatorModule)],
  controllers: [ChatController],
  providers: [ChatService, PrismaService],
  exports: [ChatService],
})
export class ChatModule {}
