import { UsageLimitMetric } from 'src/modules/usage/dto/usage-limit-metric.dto';

export interface UsageLimitStats {
  symbols: UsageLimitMetric;
  requests: UsageLimitMetric;
}
