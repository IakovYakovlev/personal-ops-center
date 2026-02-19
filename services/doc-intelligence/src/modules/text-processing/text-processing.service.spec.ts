import { Test, TestingModule } from '@nestjs/testing';
import { TextProcessingService } from './text-processing.service';

describe('TextProcessingService', () => {
  let service: TextProcessingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextProcessingService],
    }).compile();

    service = module.get<TextProcessingService>(TextProcessingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
