import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChatDto } from './dtos/create-chat.dot';

const chatSelect = {
  id: true,
  chatListId: true,
  content: true,
  createdAt: true,
} as const;

export type ChatItem = Prisma.ChatGetPayload<{
  select: typeof chatSelect;
}>;

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertChatListOwnership(userId: string, chatListId: string): Promise<void> {
    const chatList = await this.prisma.chatList.findFirst({
      where: {
        id: chatListId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!chatList) {
      throw new NotFoundException('Chat list not found');
    }
  }

  private async updateLastMessageAt(chatListId: string, timestamp: Date): Promise<void> {
    await this.prisma.chatList.update({
      where: {
        id: chatListId,
      },
      data: {
        lastMessageAt: timestamp,
      },
    });
  }

  async findAllForChatList(userId: string, chatListId: string): Promise<ChatItem[]> {
    await this.assertChatListOwnership(userId, chatListId);

    return await this.prisma.chat.findMany({
      where: { chatListId },
      select: chatSelect,
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createForChatList(userId: string, input: CreateChatDto): Promise<ChatItem> {
    await this.assertChatListOwnership(userId, input.chatListId);

    const now = new Date();

    return await this.prisma.$transaction(async (tx) => {
      const createdChat = await tx.chat.create({
        data: {
          chatListId: input.chatListId,
          content: input.content,
        },
        select: chatSelect,
      });

      await this.updateLastMessageAt(input.chatListId, now);

      return createdChat;
    });
  }
}
