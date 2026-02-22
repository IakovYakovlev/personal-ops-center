import { BadRequestException, Injectable } from '@nestjs/common';
import { PlanStrategyFactory } from './plan-strategy.factory';

@Injectable()
export class PlansService {
  constructor(private planFactory: PlanStrategyFactory) {}

  async executePlan(file: Express.Multer.File, userId: string, plan: string) {
    const strategy = this.planFactory.getStrategy(plan);
    if (!strategy) throw new BadRequestException(`Unknown plan: ${plan}`);

    return await strategy.execute({ file, userId });
  }
}
