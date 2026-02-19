import { Module } from '@nestjs/common';
import { FileReaderFactory } from 'src/modules/read/strategies/file-reader-factory';
import { PdfReaderStrategy } from 'src/modules/read/strategies/pdf.strategy';
import { DocxReaderStrategy } from 'src/modules/read/strategies/docx.strategy';
import { TxtReaderStrategy } from 'src/modules/read/strategies/txt.strategy';
import { ReadService } from 'src/modules/read/read.service';

@Module({
  providers: [
    ReadService,
    FileReaderFactory,
    PdfReaderStrategy,
    DocxReaderStrategy,
    TxtReaderStrategy,
  ],
  exports: [ReadService],
})
export class ReadModule {}
