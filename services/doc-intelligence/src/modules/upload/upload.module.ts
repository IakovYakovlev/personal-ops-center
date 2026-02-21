import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { PlansModule } from '../plans/plans.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PlansModule, AuthModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
