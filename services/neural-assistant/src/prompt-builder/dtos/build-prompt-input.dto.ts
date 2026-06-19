import { RetrievedChunk } from 'src/dock-intelligence-client/dtos/retrieved-chunk.dto';

export interface BuildPromptInput {
  message: string;
  relevantChunks: RetrievedChunk[];
  systemPrompt?: string;
}
