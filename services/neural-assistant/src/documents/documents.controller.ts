import { BadRequestException, Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { type RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { JwtGuard } from 'src/auth/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';

@Controller('documents')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async findAll(@Req() request: RequestWithUser) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in JWT token');
    }

    return await this.documentsService.findAllByUser(userId);
  }
}
