import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const chatListSelect = {
  id: true,
  userId: true,
  documentId: true,
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
  isArchived: true,
} as const;

export type ChatListItem = Prisma.ChatListGetPayload<{
  select: typeof chatListSelect;
}>;

@Injectable()
export class ChatListService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string): Promise<ChatListItem[]> {
    return await this.prisma.chatList.findMany({
      where: { userId },
      select: chatListSelect,
      orderBy: {
        lastMessageAt: 'desc',
      },
    });
  }
}
