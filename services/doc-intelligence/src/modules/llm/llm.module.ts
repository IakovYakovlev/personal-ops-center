import { Module } from '@nestjs/common';
import { LlmService } from 'src/modules/llm/llm.service';

@Module({
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}
