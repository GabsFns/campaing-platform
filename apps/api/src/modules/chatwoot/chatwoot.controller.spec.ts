import { Test, TestingModule } from '@nestjs/testing';
import { ChatwootController } from './chatwoot.controller.js';

describe('ChatwootController', () => {
  let controller: ChatwootController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatwootController],
    }).compile();

    controller = module.get<ChatwootController>(ChatwootController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
