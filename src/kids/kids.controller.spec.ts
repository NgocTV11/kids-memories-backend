import { Test, TestingModule } from '@nestjs/testing';
import { KidsController } from './kids.controller';

describe('KidsController', () => {
  let controller: KidsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KidsController],
    }).compile();

    controller = module.get<KidsController>(KidsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
