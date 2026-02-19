import { Injectable } from '@nestjs/common';
import { FileReaderStrategy } from './file-reader-strategy.interface';
import { PdfReaderStrategy } from './pdf.strategy';
import { DocxReaderStrategy } from './docx.strategy';
import { TxtReaderStrategy } from './txt.strategy';

@Injectable()
export class FileReaderFactory {
  private strategies: Map<string, FileReaderStrategy> = new Map<string, FileReaderStrategy>();

  constructor(pdf: PdfReaderStrategy, docx: DocxReaderStrategy, txt: TxtReaderStrategy) {
    this.strategies.set(pdf.key, pdf);
    this.strategies.set(docx.key, docx);
    this.strategies.set(txt.key, txt);
  }

  getStrategy(strategyKey: string): FileReaderStrategy | undefined {
    return this.strategies.get(strategyKey);
  }
}
