export interface RetrievedChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  similarity: number;
}
