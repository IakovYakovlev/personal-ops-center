import { BadRequestException, Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { DocumentsService, type DocumentListItem } from './documents.service';

@Controller('documents')
@ApiTags('documents')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async findAllForUser(@Req() request: RequestWithUser): Promise<DocumentListItem[]> {
    const userId = request.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in JWT token');
    }

    return await this.documentsService.findAllForUser(userId);
  }
}
