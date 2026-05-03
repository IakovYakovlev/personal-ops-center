'use client';

import { useQuery } from '@tanstack/react-query';
import { neuralAssistantService } from '@/lib/api/services/neural-assistant-service';
import type { ChatItem } from '@/lib/api/types/chat-item';

export function useNeuralAssistantChatMessages(chatListId: string | number | null) {
  return useQuery<ChatItem[]>({
    queryKey: ['neural-assistant', 'chat-messages', chatListId],
    queryFn: () => neuralAssistantService.getChatMessages(chatListId!),
    enabled: !!chatListId,
  });
}
