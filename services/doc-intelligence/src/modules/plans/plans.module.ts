import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlanStrategyFactory } from './plan-strategy.factory';
import { FreeStrategy } from './strategies/free.strategy';
import { ProStrategy } from './strategies/pro.strategy';
import { UsageModule } from '../usage/usage.module';
import { ReadModule } from '../read/read.module';
import { TextProcessingModule } from '../text-processing/text-processing.module';
import { JobsModule } from 'src/modules/jobs/jobs.module';

@Module({
  imports: [UsageModule, TextProcessingModule, ReadModule, JobsModule],
  providers: [PlansService, PlanStrategyFactory, FreeStrategy, ProStrategy],
  exports: [PlansService],
})
export class PlansModule {}
