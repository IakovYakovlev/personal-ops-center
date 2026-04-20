'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { docService } from '../../services/doc-service';
import { AnalysisResult, JobResult } from '../../types/documents';

const MAX_MS = 30_000; // 30 seconds
const MAX_TRIES = 30; // 30 attempts

interface UseJobPollingOptions {
  onSuccess?: (result: AnalysisResult) => void;
  onError?: (error: string) => void;
}

export function useJobPolling(jobId: string | undefined, options?: UseJobPollingOptions) {
  const { onSuccess, onError } = options || {};
  const timeoutReachedRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    startedAtRef.current = jobId ? Date.now() : null;
    attemptsRef.current = 0;
    timeoutReachedRef.current = false;
  }, [jobId]);

  const query = useQuery<JobResult>({
    queryKey: ['jobResult', jobId],
    queryFn: () => docService.getJobResult(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false; // Stop polling if job is completed or failed
      }

      const timedOut = startedAtRef.current ? Date.now() - startedAtRef.current >= MAX_MS : false;
      const attemptsExceeded = attemptsRef.current >= MAX_TRIES;

      if (timedOut || attemptsExceeded) {
        if (!timeoutReachedRef.current) {
          timeoutReachedRef.current = true;
          if (onError) {
            onError('Job timeout: exceeded time or attempts limit');
          }
        }
        return false;
      }

      attemptsRef.current += 1;
      return 3000; // Poll every 3 seconds otherwise
    },
  });

  const status = query.data?.status;
  const result = query.data?.result;
  const error = query.data?.error;

  useEffect(() => {
    if (status === 'completed' && onSuccess) {
      onSuccess(result as AnalysisResult);
    }
  }, [status, result, onSuccess]);

  useEffect(() => {
    if (status === 'failed' && onError) {
      onError(error || 'Job failed');
    }
  }, [status, error, onError]);

  return {
    status: status || 'pending',
    result: result,
    error: error,
    isPolling: query.isFetching,
  };
}
