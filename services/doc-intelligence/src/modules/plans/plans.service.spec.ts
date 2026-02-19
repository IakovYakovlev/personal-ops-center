import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from './plans.service';
import { PlanStrategyFactory } from './strategies/plan-strategy.factory';
import { FreeStrategy } from './strategies/free.strategy';
import { ProStrategy } from './strategies/pro.strategy';
import { UltraStrategy } from './strategies/ultra.strategy';
import { LlmService } from '../llm/llm.service';
import { UsageService } from '../usage/usage.service';
import { ReadService } from '../read/read.service';

describe('PlansService', () => {
  let service: PlansService;

  beforeEach(async () => {
    const mockUsageService = { checkLimit: jest.fn(), increment: jest.fn() };
    const mockLlmService = { analyzeText: jest.fn() };
    const mockRead = { read: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        PlanStrategyFactory,
        FreeStrategy,
        ProStrategy,
        UltraStrategy,
        { provide: ReadService, useValue: mockRead },
        { provide: UsageService, useValue: mockUsageService },
        { provide: LlmService, useValue: mockLlmService },
      ],
    }).compile();

    service = module.get<PlansService>(PlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
