export interface AnalysisResult {
  summary?: string;
  keywords?: string[];
  insights?: string[];
  sentiment?: string;
  main_topics?: string[];
  [key: string]: any;
}

export interface UsageStats {
  symbols: {
    used: number;
    limit: number;
    remaining: number;
    requestedSymbols: number;
  };
  requests: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export interface ServerResponse {
  status: string;
  plan: string;
  stats: UsageStats;
  result: AnalysisResult | { jobId: string };
}

export interface JobResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: AnalysisResult;
  error?: string;
  jobId?: string;
  plan?: string;
}
