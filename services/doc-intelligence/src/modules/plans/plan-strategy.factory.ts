import { Injectable } from '@nestjs/common';
import { FreeStrategy } from './strategies/free.strategy';
import { ProStrategy } from './strategies/pro.strategy';
@Injectable()
export class PlanStrategyFactory {
  constructor(
    private readonly freeStrategy: FreeStrategy,
    private readonly proStrategy: ProStrategy,
  ) {}

  getStrategy(plan: string) {
    switch (plan) {
      case 'free':
        return this.freeStrategy;
      case 'pro':
        return this.proStrategy;
      default:
        return null;
    }
  }
}
