import { UsageLimitStats } from 'src/modules/usage/dto/usage-limit-stats.dto';

/**
 * Full synchronous processing result with all analysis data
 */
export interface SyncProcessingResult {
  summary: string;
  keywords: string[];
  sentiment: string;
  main_topics: string[];
  insights: string[];
}

/**
 * Asynchronous processing result with job ID for tracking
 */
export interface AsyncProcessingResult {
  jobId: string;
}

/**
 * Union type for processing results (sync or async)
 */
export type ProcessingResult = SyncProcessingResult | AsyncProcessingResult;

/**
 * Base response structure for plan execution
 */
interface BasePlanExecutionResponse {
  status: 'done';
  plan: string;
  stats: UsageLimitStats;
}

/**
 * Synchronous plan execution response with full results
 */
export interface SyncPlanExecutionResponse extends BasePlanExecutionResponse {
  result: SyncProcessingResult;
}

/**
 * Asynchronous plan execution response with job ID
 */
export interface AsyncPlanExecutionResponse extends BasePlanExecutionResponse {
  result: AsyncProcessingResult;
}

/**
 * Discriminated union type for plan execution response
 * Can be either synchronous (with full results) or asynchronous (with job ID)
 */
export type PlanExecutionResponse = SyncPlanExecutionResponse | AsyncPlanExecutionResponse;

/**
 * Type guard to check if the response is synchronous (with full results)
 */
export function isSyncResponse(
  response: PlanExecutionResponse,
): response is SyncPlanExecutionResponse {
  return 'summary' in response.result;
}

/**
 * Type guard to check if the response is asynchronous (with job ID)
 */
export function isAsyncResponse(
  response: PlanExecutionResponse,
): response is AsyncPlanExecutionResponse {
  return 'jobId' in response.result;
}
