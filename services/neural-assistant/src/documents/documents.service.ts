import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocumentsService {
  constructor(private readonly configService: ConfigService) {}

  async findAllForUser(userId: string, authorizationHeader?: string) {
    const baseUrl = this.configService.get<string>('DOC_INTELLIGENCE_API_URL');
    if (!baseUrl) {
      throw new InternalServerErrorException('DOC_INTELLIGENCE_API_URL is not configured');
    }

    const url = new URL('/documents', baseUrl);
    url.searchParams.set('userId', userId);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(authorizationHeader ? { authorization: authorizationHeader } : {}),
      },
    });

    if (!response.ok) {
      const details = await response.text();
      throw new BadGatewayException(
        `doc-intelligence request failed (${response.status}): ${details}`,
      );
    }

    return await response.json();
  }
}
