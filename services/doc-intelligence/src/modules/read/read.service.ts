import { BadRequestException, Injectable } from '@nestjs/common';
import { FileReaderFactory } from 'src/modules/read/strategies/file-reader-factory';
import path from 'path';

@Injectable()
export class ReadService {
  constructor(private readonly factory: FileReaderFactory) {}

  async read(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded.');

    // Проверка по magic bytes (первые байты файла)
    const magicBytes = file.buffer.slice(0, 4).toString('hex');

    const ALLOWED_MAGIC = {
      pdf: '25504446', // %PDF
      docx: '504b0304', // PK.. (ZIP)
      txt: null, // TXT может быть любое содержимое
    };

    const ext = path.extname(file.originalname).replace('.', '').toLowerCase();

    if (ALLOWED_MAGIC[ext] && magicBytes !== ALLOWED_MAGIC[ext]) {
      throw new BadRequestException(`Invalid file content for type: ${ext}`);
    }

    const strategy = this.factory.getStrategy(ext);
    if (!strategy) {
      throw new BadRequestException(`Unsupported file type: ${ext}`);
    }

    return await strategy.read(file.buffer);
  }
}
