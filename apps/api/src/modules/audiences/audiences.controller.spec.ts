import { Test, TestingModule } from '@nestjs/testing';
import { AudiencesController } from './audiences.controller.js';

describe('AudiencesController', () => {
  let controller: AudiencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AudiencesController],
    }).compile();

    controller = module.get<AudiencesController>(AudiencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
