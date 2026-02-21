import { Module } from '@nestjs/common';
import { TextProcessingService } from './text-processing.service';
import { LlmModule } from 'src/modules/llm/llm.module';

@Module({
  imports: [LlmModule],
  providers: [TextProcessingService],
  exports: [TextProcessingService],
})
export class TextProcessingModule {}
