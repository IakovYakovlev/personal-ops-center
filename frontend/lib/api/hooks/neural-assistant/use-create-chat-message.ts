'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { neuralAssistantService } from '@/lib/api/services/neural-assistant-service';
import type { ChatItem } from '@/lib/api/types/chat-item';

interface CreateChatMessageVariables {
  chatListId: string;
  content: string;
}

export function useCreateChatMessage() {
  const queryClient = useQueryClient();

  return useMutation<ChatItem, Error, CreateChatMessageVariables>({
    mutationFn: ({ chatListId, content }) =>
      neuralAssistantService.createChatMessage(chatListId, content),
    onSuccess: (_, { chatListId }) => {
      void queryClient.invalidateQueries({
        queryKey: ['neural-assistant', 'chat-messages', chatListId],
      });
    },
  });
}
