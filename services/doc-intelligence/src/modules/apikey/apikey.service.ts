import { Injectable } from '@nestjs/common';

@Injectable()
export class ApikeyService {
  private readonly defaultKey = process.env.X_API_KEY ?? 'apiKeyAuth';

  async validateKey(key: string): Promise<boolean> {
    return key === this.defaultKey;
  }
}
