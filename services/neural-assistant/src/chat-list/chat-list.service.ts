import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
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

  /**
   * Обновить ChatList (например, зафиксировать documentId)
   *
   * Валидация:
   * - Проверяет, что ChatList существует и принадлежит пользователю
   * - Если documentId уже зафиксирован и отличается — возвращает конфликт
   * - Если documentId совпадает — идемпотентный успех
   */
  async update(
    userId: string,
    chatListId: string,
    data: { documentId?: string },
  ): Promise<ChatListItem> {
    // Проверяем, что ChatList существует и принадлежит пользователю
    const existingChatList = await this.prisma.chatList.findFirst({
      where: {
        id: chatListId,
        userId,
      },
      select: {
        id: true,
        documentId: true,
      },
    });

    if (!existingChatList) {
      throw new NotFoundException('Chat list not found');
    }

    // Если обновляем documentId
    if (data.documentId) {
      // Если documentId уже установлен и отличается
      if (existingChatList.documentId && existingChatList.documentId !== data.documentId) {
        throw new ConflictException(
          'Document is already locked for this chat. Cannot change to a different document.',
        );
      }
    }

    return await this.prisma.chatList.update({
      where: { id: chatListId },
      data,
      select: chatListSelect,
    });
  }
}
