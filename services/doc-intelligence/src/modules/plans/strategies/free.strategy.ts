import { Injectable } from '@nestjs/common';
import { ReadService } from 'src/modules/read/read.service';
import { UsageService } from 'src/modules/usage/usage.service';
import { TextProcessingService } from 'src/modules/text-processing/text-processing.service';
import { BasePlanStrategy } from 'src/modules/plans/strategies/base.plan-strategy';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FreeStrategy extends BasePlanStrategy {
  constructor(
    reader: ReadService,
    usage: UsageService,
    private readonly textProcessing: TextProcessingService,
  ) {
    super(reader, usage);
  }

  protected getPlanName(): string {
    return 'free';
  }

  protected processText(text: string): Promise<any> {
    const jobId: string = uuid();
    return this.textProcessing.processAsync(text, jobId);
  }
}
