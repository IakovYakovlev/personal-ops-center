import { SetMetadata } from '@nestjs/common';
import { DEFAULT_RATE_LIMIT_WINDOW_MS, RATE_LIMIT_KEY } from '../constants/rate-limit.constants';

export const RateLimit = (requests: number, windowMs: number = DEFAULT_RATE_LIMIT_WINDOW_MS) =>
  SetMetadata(RATE_LIMIT_KEY, { requests, windowMs });
