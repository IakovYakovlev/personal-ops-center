import { BadRequestException, Injectable } from '@nestjs/common';
import { FileReaderFactory } from 'src/modules/read/strategies/file-reader-factory';
import path from 'path';

@Injectable()
export class ReadService {
  constructor(private readonly factory: FileReaderFactory) {}

  async read(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded.');

    const ext = path.extname(file.originalname).replace('.', '');
    const strategy = this.factory.getStrategy(ext);
    if (!strategy) {
      throw new BadRequestException(`Unsupported file type: ${ext}`);
    }

    return await strategy.read(file.buffer);
  }
}
