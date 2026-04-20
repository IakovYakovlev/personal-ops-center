import { Test, TestingModule } from '@nestjs/testing';
import { ChatListController } from './chat-list.controller';
import { ChatListService } from './chat-list.service';

describe('ChatListController', () => {
  let controller: ChatListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatListController],
      providers: [ChatListService],
    }).compile();

    controller = module.get<ChatListController>(ChatListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
