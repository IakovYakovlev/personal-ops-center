import { Injectable } from '@nestjs/common';
import { FreeStrategy } from './free.strategy';
import { ProStrategy } from './pro.strategy';
import { UltraStrategy } from './ultra.strategy';

@Injectable()
export class PlanStrategyFactory {
  constructor(
    private readonly freeStrategy: FreeStrategy,
    private readonly proStrategy: ProStrategy,
    private readonly ultrastrategy: UltraStrategy,
  ) {}

  getStrategy(plan: string) {
    switch (plan) {
      case 'free':
        return this.freeStrategy;
      case 'pro':
        return this.proStrategy;
      case 'ultra':
        return this.ultrastrategy;
      default:
        return null;
    }
  }
}
