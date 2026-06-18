import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('retrieval')
@ApiTags('retrieval')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, RateLimitGuard)
export class RetrievalController {}
