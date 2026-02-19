import { Injectable } from '@nestjs/common';
import { FileReaderStrategy } from './file-reader-strategy.interface';
import pdfParseModule from 'pdf-parse';

const pdfParse = (pdfParseModule as any).default || (pdfParseModule as any);

@Injectable()
export class PdfReaderStrategy implements FileReaderStrategy {
  key = 'pdf';

  async read(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return data.text?.trim() ?? '';
  }
}
