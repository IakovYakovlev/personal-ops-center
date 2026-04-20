import { Test, TestingModule } from '@nestjs/testing';
import { ChatListService } from './chat-list.service';

describe('ChatListService', () => {
  let service: ChatListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatListService],
    }).compile();

    service = module.get<ChatListService>(ChatListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
