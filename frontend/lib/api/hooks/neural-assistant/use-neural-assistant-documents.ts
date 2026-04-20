'use client';

import { useQuery } from '@tanstack/react-query';
import { neuralAssistantService } from '@/lib/api/services/neural-assistant-service';
import type { NeuralAssistantDocumentsResponse } from '@/lib/api/types/neural-assistant';

export function useNeuralAssistantDocuments() {
  return useQuery<NeuralAssistantDocumentsResponse>({
    queryKey: ['neural-assistant', 'documents'],
    queryFn: () => neuralAssistantService.getDocuments(),
  });
}
