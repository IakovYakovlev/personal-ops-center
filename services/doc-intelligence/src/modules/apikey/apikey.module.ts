import { Global, Module } from '@nestjs/common';
import { ApiKeyGuard } from './apikey.guard';
import { ApikeyService } from './apikey.service';

@Global()
@Module({
  providers: [ApiKeyGuard, ApikeyService],
  exports: [ApiKeyGuard, ApikeyService],
})
export class ApikeyModule {}
