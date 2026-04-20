import {
  type ApiErrorResponse,
  type NeuralAssistantDocumentsResponse,
} from '@/lib/api/types/neural-assistant';

const API_BASE = '/api/neural-assistant';

const handleResponseError = async (response: Response, operation: string): Promise<never> => {
  const errorData = (await response.json().catch(() => ({}))) as Partial<ApiErrorResponse>;
  const errorMessage = errorData.message || `Failed to ${operation} (${response.status})`;
  throw new Error(errorMessage);
};

export const neuralAssistantService = {
  async getDocuments(): Promise<NeuralAssistantDocumentsResponse> {
    const response = await fetch(`${API_BASE}/documents`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      await handleResponseError(response, 'fetch neural-assistant documents');
    }

    return response.json() as Promise<NeuralAssistantDocumentsResponse>;
  },
};
