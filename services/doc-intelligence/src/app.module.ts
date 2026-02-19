import { Module } from '@nestjs/common';
import { ApikeyModule } from 'src/modules/apikey/apikey.module';
import { UploadModule } from './modules/upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import { UsageModule } from 'src/modules/usage/usage.module';
import { PlansModule } from './modules/plans/plans.module';
import { TextProcessingModule } from 'src/modules/text-processing/text-processing.module';
import { JobsModule } from 'src/modules/jobs/jobs.module';

@Module({
  imports: [
    UsageModule,
    ApikeyModule,
    UploadModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PlansModule,
    TextProcessingModule,
    JobsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
