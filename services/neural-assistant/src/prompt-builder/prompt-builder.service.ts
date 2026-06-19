import { Injectable } from '@nestjs/common';
import { RetrievedChunk } from 'src/dock-intelligence-client/dtos/retrieved-chunk.dto';
import { BuildPromptInput } from './dtos/build-prompt-input.dto';

@Injectable()
export class PromptBuilderService {
  private readonly defaultSystemPrompt = [
    'You are a helpful assistant for document-grounded question answering.',
    'Use only the provided context to answer the user question.',
    'If the context is insufficient, say that you do not have enough information.',
    'Answer in the same language as the user question.',
    'Do not mention internal implementation details or that you are using RAG.',
  ].join(' ');

  buildPrompt(input: BuildPromptInput): string {
    const systemPrompt = (input.systemPrompt ?? this.defaultSystemPrompt).trim();
    const question = input.message.trim();
    const contextBlock = this.buildContextBlock(input.relevantChunks);

    return [
      `System:\n${systemPrompt}`,
      `Context:\n${contextBlock}`,
      `User question:\n${question}`,
      'Answer with a concise, direct response grounded in the context above.',
    ].join('\n\n');
  }

  private buildContextBlock(relevantChunks: RetrievedChunk[]): string {
    if (relevantChunks.length === 0) {
      return 'No relevant context was found.';
    }

    return relevantChunks
      .map((chunk, index) => {
        const similarity = chunk.similarity.toFixed(4);

        return [
          `Chunk ${index + 1}`,
          `documentId: ${chunk.documentId}`,
          `chunkIndex: ${chunk.chunkIndex}`,
          `similarity: ${similarity}`,
          'content:',
          chunk.content.trim(),
        ].join('\n');
      })
      .join('\n\n---\n\n');
  }
}
