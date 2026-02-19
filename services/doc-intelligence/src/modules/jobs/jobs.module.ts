import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { BullModule } from '@nestjs/bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { TextProcessingModule } from 'src/modules/text-processing/text-processing.module';
import { JobsProcessor } from 'src/modules/jobs/jobs.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'processing',
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    TextProcessingModule,
  ],
  providers: [JobsService, PrismaService, JobsProcessor],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
