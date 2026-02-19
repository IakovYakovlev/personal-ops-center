import { UsageService } from 'src/modules/usage/usage.service';
import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  providers: [UsageService, PrismaService],
  exports: [UsageService],
})
export class UsageModule {}
