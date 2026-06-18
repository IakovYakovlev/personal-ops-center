import { Module } from '@nestjs/common';
import { RetrievalController } from './retrieval.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RetrievalController],
})
export class RetrievalModule {}
