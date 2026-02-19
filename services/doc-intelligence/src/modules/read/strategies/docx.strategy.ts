import { Injectable } from '@nestjs/common';
import { FileReaderStrategy } from './file-reader-strategy.interface';
import mammoth from 'mammoth';

@Injectable()
export class DocxReaderStrategy implements FileReaderStrategy {
  key = 'docx';

  async read(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
}
