import { Controller, Get, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { RateLimit } from 'src/common/decorators/rate-limit.decorator';
import { JobsService } from 'src/modules/jobs/jobs.service';
import { JwtGuard } from '../auth/jwt.guard';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RATE_LIMITS } from 'src/common/constants/rate-limit.constants';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@Controller('jobs')
@ApiTags('jobs')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, RateLimitGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get(':id')
  @RateLimit(RATE_LIMITS.GET_JOB_RESULT)
  async getJobResult(@Param('id') jobId: string, @Req() request: RequestWithUser) {
    // Extract userId from JWT payload (set by JwtGuard)
    const userId = request.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in JWT token');
    }

    // 1. Сначала проверяем Redis (job выполняется)
    const redisData = await this.jobsService.getJobStatus(jobId, userId);
    if (redisData) return redisData;

    // 2. Если job завершена - достаем из PostgreSQL
    return await this.jobsService.getJobFromDb(jobId, userId);
  }
}
