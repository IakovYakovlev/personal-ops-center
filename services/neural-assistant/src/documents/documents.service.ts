import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    // Возвращаем только нужные поля (id, title, createdAt, updatedAt и т.д.)
    return await this.prisma.document.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        // добавь другие нужные поля
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
