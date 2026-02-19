import { Plan, Usage } from '@prisma/client';
import { UsageLimitStats } from 'src/modules/usage/dto/usage-limit-stats.dto';

export interface UsageCheckResult {
  allowed: boolean;
  usage: Usage;
  plan: Plan;
  stats: UsageLimitStats;
}
