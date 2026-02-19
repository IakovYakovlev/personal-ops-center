export interface UsageLimitMetric {
  used: number;
  limit: number;
  remaining: number;
  requestedSymbols?: number;
}
