import { AnalysisResult, UsageStats } from '@/lib/api/types/documents';

export type Strategy = 'sync' | 'async';
export type Status = 'idle' | 'processing' | 'complete' | 'error';

export interface ProcessingState {
  status: Status;
  jobId?: string;
  result?: AnalysisResult;
  error?: string;
  stats?: UsageStats;
  plan?: string;
}
