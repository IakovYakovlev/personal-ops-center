import { Controller, Get, Param, Headers } from '@nestjs/common';
import { JobsService } from 'src/modules/jobs/jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get(':id')
  async getJobResult(@Param('id') jobId: string, @Headers('x-rapidapi-user') userId: string) {
    // 1. Сначала проверяем Redis (job выполняется)
    const redisData = await this.jobsService.getJobStatus(jobId, userId);
    if (redisData) return redisData;

    // 2. Если job завершена - достаем из PostgreSQL
    return await this.jobsService.getJobFromDb(jobId, userId);
  }
}
