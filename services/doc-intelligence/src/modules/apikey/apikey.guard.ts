import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ApikeyService } from './apikey.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApikeyService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    if (!apiKey) throw new UnauthorizedException('Missing API Key');

    const isValid = await this.apiKeyService.validateKey(apiKey);
    if (!isValid) throw new UnauthorizedException('Invalid API Key');

    return true;
  }
}
