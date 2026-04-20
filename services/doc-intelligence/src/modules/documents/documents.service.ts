import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

const documentListSelect = {
  id: true,
  userId: true,
  status: true,
  chunksCount: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type DocumentListItem = Prisma.DocumentGetPayload<{
  select: typeof documentListSelect;
}>;

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string): Promise<DocumentListItem[]> {
    return await this.prisma.document.findMany({
      where: { userId },
      select: documentListSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
