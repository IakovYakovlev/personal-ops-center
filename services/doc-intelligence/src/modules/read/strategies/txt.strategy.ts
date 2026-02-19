import { Injectable } from '@nestjs/common';
import { FileReaderStrategy } from './file-reader-strategy.interface';

@Injectable()
export class TxtReaderStrategy implements FileReaderStrategy {
  key = 'txt';

  // eslint-disable-next-line @typescript-eslint/require-await
  async read(buffer: Buffer): Promise<string> {
    return buffer.toString('utf-8');
  }
}
