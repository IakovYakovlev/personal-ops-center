import { PlanStrategy } from 'src/modules/plans/strategies/plan-strategy.interface';
import { ReadService } from 'src/modules/read/read.service';
import { UsageService } from 'src/modules/usage/usage.service';
import { ForbiddenException } from '@nestjs/common';

export abstract class BasePlanStrategy implements PlanStrategy {
  protected constructor(
    protected readonly reader: ReadService,
    protected readonly usage: UsageService,
  ) {}

  async execute(input: { file: Express.Multer.File; userId: string }): Promise<any> {
    const { file, userId } = input;

    // 1. Read file
    const text = await this.reader.read(file);
    const symbols = text.length;

    // 2. Check usage
    const usageCheck = await this.usage.checkLimit(userId, this.getPlanName(), symbols);
    if (!usageCheck.allowed) {
      throw new ForbiddenException({
        message: `Usage limit reached for your ${this.getPlanName()} plan.`,
        limits: usageCheck.stats,
      });
    }

    // 3. Process text - implemented in subsclass
    const result = await this.processText(text, userId);

    // 4. Update usage
    await this.usage.increment(userId, this.getPlanName(), symbols);

    return {
      status: 'done',
      plan: this.getPlanName(),
      stats: usageCheck.stats,
      result,
    };
  }

  protected abstract processText(text: string, userId: string): Promise<any>;

  protected abstract getPlanName(): string;
}
