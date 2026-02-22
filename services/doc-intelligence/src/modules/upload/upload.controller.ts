import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Headers,
  UseFilters,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileSwaggerDto } from 'src/modules/upload/dto/upload-file.swagger.dto';
import { LogTimeInterceptor } from 'src/common/interceptors/log-time.interceptor';
import { JwtGuard } from '../auth/jwt.guard';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { RATE_LIMITS } from 'src/common/constants/rate-limit.constants';
import { RateLimit } from 'src/common/decorators/rate-limit.decorator';
import { FileSizeExceptionFilter } from 'src/common/filters/file-size-exception.filter';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@Controller('upload')
@ApiTags('upload')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, RateLimitGuard)
@UseFilters(FileSizeExceptionFilter)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @ApiOperation({ summary: 'Прочитать загруженный файл (PDF, DOCX, TXT)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileSwaggerDto })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
      },
    }),
    new LogTimeInterceptor('Upload endpoint'),
  )
  @RateLimit(RATE_LIMITS.UPLOAD_FILE)
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: RequestWithUser,
    @Headers('plan') plan: string,
  ) {
    // Extract userId from JWT payload (set by JwtGuard)
    const userId = request.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in JWT token');
    }

    return await this.uploadService.processUpload(file, userId, plan);
  }
}
