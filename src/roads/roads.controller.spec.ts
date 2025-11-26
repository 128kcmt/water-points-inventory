import { Test, TestingModule } from '@nestjs/testing';
import { RoadsController } from './roads.controller';

describe('RoadsController', () => {
  let controller: RoadsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoadsController],
    }).compile();

    controller = module.get<RoadsController>(RoadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
