'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { neuralAssistantService } from '@/lib/api/services/neural-assistant-service';
import type { ChatListItem } from '@/lib/api/types/chat-list';

export function useCreateChatList() {
  const queryClient = useQueryClient();

  return useMutation<ChatListItem, Error, void>({
    mutationFn: () => neuralAssistantService.createChatList(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['neural-assistant', 'chats'],
      });
    },
  });
}
