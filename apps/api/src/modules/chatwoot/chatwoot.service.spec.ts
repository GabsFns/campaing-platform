import { Test, TestingModule } from '@nestjs/testing';
import { ChatwootService } from './chatwoot.service.js';

describe('ChatwootService', () => {
  let service: ChatwootService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatwootService],
    }).compile();

    service = module.get<ChatwootService>(ChatwootService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
