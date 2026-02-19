import { Module } from '@nestjs/common';
import { TextProcessingService } from './text-processing.service';
import { LlmModule } from 'src/modules/llm/llm.module';
import Redis from 'ioredis';

@Module({
  imports: [LlmModule],
  providers: [
    TextProcessingService,
    {
      provide: 'REDIS',
      useFactory: () => new Redis(process.env.REDIS_URL || 'redis://localhost:6379'),
    },
  ],
  exports: [TextProcessingService],
})
export class TextProcessingModule {}
