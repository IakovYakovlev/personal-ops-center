import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RelevantChunksRequest } from './dtos/relevant-chunks-request.dto';

@Injectable()
export class DockIntelligenceClientService {
  private readonly baseUrl: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('DOC_INTELLIGENCE_API_URL');
  }

  async findRelevantChunks(
    queryEmbedding: number[],
    documentId: string,
    authorizationHeader?: string,
  ) {
    if (!this.baseUrl) {
      throw new Error('DOC_INTELLIGENCE_API_URL is not configured');
    }

    const relevantRequest: RelevantChunksRequest = {
      queryEmbedding: queryEmbedding,
      documentId: documentId,
    };

    const url = new URL('/retrieval', this.baseUrl);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorizationHeader ? { authorization: authorizationHeader } : {}),
      },
      body: JSON.stringify(relevantRequest),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`doc-intelligence request failed (${response.status}): ${details}`);
    }

    return await response.json();
  }
}
