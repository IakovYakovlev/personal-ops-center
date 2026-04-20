export interface NeuralAssistantDocumentItem {
  id: string;
  userId: string;
  status: string;
  chunksCount: number;
  createdAt: string;
  updatedAt: string;
}

export type NeuralAssistantDocumentsResponse = NeuralAssistantDocumentItem[];

export interface ApiErrorResponse {
  message: string;
}
