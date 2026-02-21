import { Module } from '@nestjs/common';
import { UploadModule } from './modules/upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import { UsageModule } from 'src/modules/usage/usage.module';
import { PlansModule } from './modules/plans/plans.module';
import { TextProcessingModule } from 'src/modules/text-processing/text-processing.module';
import { JobsModule } from 'src/modules/jobs/jobs.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    UsageModule,
    UploadModule,
    PlansModule,
    TextProcessingModule,
    JobsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
