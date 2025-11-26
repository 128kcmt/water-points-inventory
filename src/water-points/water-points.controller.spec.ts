import { Test, TestingModule } from '@nestjs/testing';
import { WaterPointsController } from './water-points.controller';

describe('WaterPointsController', () => {
  let controller: WaterPointsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaterPointsController],
    }).compile();

    controller = module.get<WaterPointsController>(WaterPointsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
