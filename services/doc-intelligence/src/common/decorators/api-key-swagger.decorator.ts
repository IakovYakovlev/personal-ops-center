import { applyDecorators } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

export function ApiKeySwagger() {
  return applyDecorators(ApiSecurity('x-api-key'));
}
