/**
 * Documents Page - AI Document Intelligence
 *
 * Architecture decisions:
 * - State management: see ADR-0003 (TanStack Query)
 * - Validation layers: see ADR-0005 (Multi-layer validation strategy)
 *
 * Related docs:
 * - docs/architecture/adr/0003-frontend-state-management-strategy.md
 * - docs/architecture/adr/0005-validation-layers-strategy.md
 */

import { JobResult, ServerResponse } from '../types/documents';

const API_BASE = '/api/docs';

// Helper: Consistent error handling for failed responses
const handleResponseError = async (response: Response, operation: string): Promise<never> => {
  const errorData = await response.json().catch(() => ({}));
  const errorMessage = errorData.message || `Failed to ${operation} (${response.status})`;
  throw new Error(errorMessage);
};

// Helper: Validate file before upload (client-side validation layer 1)
const validateUploadFile = (file: File) => {
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only PDF, DOCX, and TXT files are supported.');
  }

  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit.');
  }
};

export const docService = {
  uploadDocument: async (file: File, strategy: 'sync' | 'async'): Promise<ServerResponse> => {
    validateUploadFile(file);

    // Use multipart/form-data so the backend can parse the uploaded file field
    const formData = new FormData();
    formData.append('file', file);

    // Strategy determines the plan: sync = free, async = pro
    const plan = strategy === 'sync' ? 'free' : 'pro';

    const response = await fetch(`${API_BASE}/upload?strategy=${strategy}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        // Client preference: backend expects 'free' or 'pro' plan hint
        plan,
      },
    });

    if (!response.ok) {
      await handleResponseError(response, 'upload document');
    }

    return response.json() as Promise<ServerResponse>;
  },

  getJobResult: async (jobId: string): Promise<JobResult> => {
    const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
      method: 'GET',
      credentials: 'include', // Browser automatically sends httpOnly cookie
      headers: {
        plan: 'pro', // Job results are always from async/pro plan
      },
    });

    if (!response.ok) {
      await handleResponseError(response, 'get job result');
    }

    return response.json() as Promise<JobResult>;
  },
};
