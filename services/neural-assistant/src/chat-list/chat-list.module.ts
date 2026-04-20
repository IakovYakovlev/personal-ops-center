import { Module } from '@nestjs/common';
import { ChatListService } from './chat-list.service';
import { ChatListController } from './chat-list.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [ChatListController],
  providers: [ChatListService, PrismaService],
})
export class ChatListModule {}
