export interface ChatListItem {
  id: string;
  userId: string;
  documentId: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  isArchived: boolean;
}

export type ChatListResponse = ChatListItem[];
