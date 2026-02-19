import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { v4 as uuid } from 'uuid';
import Redis from 'ioredis';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JobsService {
  private redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  private processingQueue: Queue;

  constructor(private readonly prisma: PrismaService) {
    this.processingQueue = new Queue('processing', {
      connection: new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: null,
      }),
    });
  }

  async createJob(text: string, userId: string, plan: string) {
    const jobId: string = uuid();

    // Сохраняем запись в PostgreSQL как pending
    await this.prisma.job.create({
      data: {
        id: jobId,
        userId,
        plan,
        status: 'pending',
      },
    });

    // Сохраним временый статус в Redis
    await this.redis.set(
      `job:${jobId}`,
      JSON.stringify({ status: 'pending', userId, plan }),
      'EX',
      60 * 30,
    );

    await this.processingQueue.add(
      'process-document',
      { text, userId, plan },
      {
        jobId,
        attempts: 5, // retry 5 times
        backoff: { type: 'exponential', delay: 5000 }, // 5 сек, 10 сек, 20 сек...
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    return { jobId };
  }

  async getJobStatus(jobId: string, userId: string) {
    const data = await this.redis.get(`job:${jobId}`);
    if (!data) return null;

    const job = JSON.parse(data);
    if (job.userId !== userId) throw new ForbiddenException('Access denied');

    return { jobId, ...job };
  }

  async getJobFromDb(jobId: string, userId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.userId !== userId) throw new ForbiddenException('Access denied');

    return { jobId, status: job.status, result: job.result };
  }
}
