import { Test, TestingModule } from '@nestjs/testing';
import { WaterPointsService } from './water-points.service';

describe('WaterPointsService', () => {
  let service: WaterPointsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaterPointsService],
    }).compile();

    service = module.get<WaterPointsService>(WaterPointsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
