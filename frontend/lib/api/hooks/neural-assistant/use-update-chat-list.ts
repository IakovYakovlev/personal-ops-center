'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { neuralAssistantService } from '@/lib/api/services/neural-assistant-service';
import type { ChatListItem } from '@/lib/api/types/chat-list';

interface UpdateChatListVariables {
  chatListId: string;
  documentId: string;
}

export function useUpdateChatList() {
  const queryClient = useQueryClient();

  return useMutation<ChatListItem, Error, UpdateChatListVariables>({
    mutationFn: ({ chatListId, documentId }) =>
      neuralAssistantService.updateChatList(chatListId, { documentId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['neural-assistant', 'chats'],
      });
    },
  });
}
