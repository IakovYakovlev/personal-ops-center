import {
  type ApiErrorResponse,
  type NeuralAssistantDocumentsResponse,
} from '@/lib/api/types/neural-assistant';
import type { ChatListResponse } from '@/lib/api/types/chat-list';
import type { ChatItem } from '@/lib/api/types/chat-item';

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
  async getChats(): Promise<ChatListResponse> {
    const response = await fetch(`${API_BASE}/chat-list`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      await handleResponseError(response, 'fetch neural-assistant chats');
    }

    return response.json() as Promise<ChatListResponse>;
  },

  async getChatMessages(chatListId: string | number): Promise<ChatItem[]> {
    const response = await fetch(`${API_BASE}/chat?chatListId=${chatListId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      await handleResponseError(response, 'fetch neural-assistant chat messages');
    }

    return response.json() as Promise<ChatItem[]>;
  },
};
