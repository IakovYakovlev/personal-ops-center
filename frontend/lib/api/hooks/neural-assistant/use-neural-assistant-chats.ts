'use client';

import { useQuery } from '@tanstack/react-query';
import { neuralAssistantService } from '@/lib/api/services/neural-assistant-service';
import type { ChatListResponse } from '@/lib/api/types/chat-list';

export function useNeuralAssistantChats() {
  return useQuery<ChatListResponse>({
    queryKey: ['neural-assistant', 'chats'],
    queryFn: () => neuralAssistantService.getChats(),
  });
}
