import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Headers,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from 'src/modules/apikey/apikey.guard';
import { ApiKeySwagger } from 'src/common/decorators/api-key-swagger.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileSwaggerDto } from 'src/modules/upload/dto/upload-file.swagger.dto';
import { LogTimeInterceptor } from 'src/common/interceptors/log-time.interceptor';

@ApiTags('upload')
@ApiKeySwagger()
@UseGuards(ApiKeyGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @ApiOperation({ summary: 'Прочитать загруженный файл (PDF, DOCX, TXT)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileSwaggerDto })
  @UseInterceptors(FileInterceptor('file'), new LogTimeInterceptor('Upload endpoint'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-rapidapi-user') userId: string,
    @Headers('x-rapidapi-subscription') plan: string,
  ) {
    return await this.uploadService.processUpload(file, userId, plan);
  }
}
