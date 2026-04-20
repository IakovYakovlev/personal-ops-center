'use client';

import { docService } from '@/lib/api/services/doc-service';
import { ServerResponse } from '@/lib/api/types/documents';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UploadOptions {
  onSuccess?: (data: ServerResponse) => void;
  onError?: (error: Error) => void;
}

export function useDocumentUpload(options?: UploadOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, strategy }: { file: File; strategy: 'sync' | 'async' }) =>
      docService.uploadDocument(file, strategy),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
