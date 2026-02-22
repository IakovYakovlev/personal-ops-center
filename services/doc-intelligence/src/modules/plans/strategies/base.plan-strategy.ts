import { PlanStrategy } from 'src/modules/plans/plan-strategy.interface';
import { ReadService } from 'src/modules/read/read.service';
import { UsageService } from 'src/modules/usage/usage.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

export abstract class BasePlanStrategy implements PlanStrategy {
  protected constructor(
    protected readonly reader: ReadService,
    protected readonly usage: UsageService,
  ) {}

  async execute(input: { file: Express.Multer.File; userId: string }): Promise<any> {
    const { file, userId } = input;

    // Read file
    const text = await this.reader.read(file);
    const symbols = text.length;

    // Check file size
    if (text.length > 6000) {
      throw new BadRequestException(
        `File contains ${text.length} characters. Maximum allowed: 6000 characters.`,
      );
    }

    // Check usage
    const usageCheck = await this.usage.checkLimit(userId, this.getPlanName(), symbols);
    if (!usageCheck.allowed) {
      throw new ForbiddenException({
        message: `Usage limit reached for your ${this.getPlanName()} plan.`,
        limits: usageCheck.stats,
      });
    }

    // Process text - implemented in subsclass
    const result = await this.processText(text, userId);

    // Update usage
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
