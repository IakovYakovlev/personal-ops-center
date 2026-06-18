import { Test, TestingModule } from '@nestjs/testing';
import { ChatMediatorService } from './chat-mediator.service';

describe('ChatMediatorService', () => {
  let service: ChatMediatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatMediatorService],
    }).compile();

    service = module.get<ChatMediatorService>(ChatMediatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
