import { Module } from '@nestjs/common';
import { WaterPointsService } from './water-points.service';

@Module({
  providers: [WaterPointsService]
})
export class WaterPointsModule {}
