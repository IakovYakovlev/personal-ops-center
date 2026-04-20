import { BadRequestException, Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { type RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { JwtGuard } from '../auth/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('documents')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async findAllForUser(@Req() request: RequestWithUser) {
    const userId: string = request.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in JWT token');
    }

    return await this.documentsService.findAllForUser(userId, request.headers.authorization);
  }
}
