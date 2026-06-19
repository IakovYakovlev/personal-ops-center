import { Module } from '@nestjs/common';
import { RetrievalController } from './retrieval.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../../prisma/prisma.service';
import { RetrievalService } from './retrieval.service';

@Module({
  imports: [AuthModule],
  providers: [PrismaService, RetrievalService],
  controllers: [RetrievalController],
})
export class RetrievalModule {}
