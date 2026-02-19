import { ApiProperty } from '@nestjs/swagger';

export class UploadFileSwaggerDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Загружаемый файл (.pdf, .docx, .txt)',
  })
  file: any;
}
