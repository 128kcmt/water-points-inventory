import { Module } from '@nestjs/common';
import { WaterPointsService } from './water-points.service';
import { WaterPointsController } from './water-points.controller';

@Module({
  providers: [WaterPointsService],
  controllers: [WaterPointsController]
})
export class WaterPointsModule {}
