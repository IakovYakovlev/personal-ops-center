import { BadRequestException, Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { JwtGuard } from '../auth/jwt.guard';
import { RetrievedChunk } from './dtos/retrieved-chunk.dto';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { RetrievalService } from './retrieval.service';
import { RelevantChunksRequest } from './dtos/relevant-chunks-request.dto';

@Controller('retrieval')
@ApiTags('retrieval')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, RateLimitGuard)
export class RetrievalController {
  constructor(private readonly retrievalService: RetrievalService) {}

  @Post()
  async findRelevantChunks(
    @Req() request: RequestWithUser,
    @Body() relevantRequest: RelevantChunksRequest,
  ): Promise<RetrievedChunk[]> {
    const userId = request.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in JWT token');
    }

    return await this.retrievalService.findRelevantChunks({
      userId,
      queryEmbedding: relevantRequest.queryEmbedding,
      documentId: relevantRequest.documentId,
    });
  }
}
