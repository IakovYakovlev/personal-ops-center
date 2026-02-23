import { Injectable } from '@nestjs/common';
import { ReadService } from 'src/modules/read/read.service';
import { UsageService } from 'src/modules/usage/usage.service';
import { BasePlanStrategy } from 'src/modules/plans/strategies/base.plan-strategy';
import { AsyncProcessingResult } from 'src/modules/plans/plan-execution.types';
import { JobsService } from 'src/modules/jobs/jobs.service';

@Injectable()
export class ProStrategy extends BasePlanStrategy {
  constructor(
    reader: ReadService,
    usage: UsageService,
    private readonly jobsService: JobsService,
  ) {
    super(reader, usage);
  }

  protected getPlanName(): string {
    return 'pro';
  }

  protected async processText(text: string, userId: string): Promise<AsyncProcessingResult> {
    return this.jobsService.createJob(text, userId, 'pro');
  }
}
