import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaterPointsService } from './water-points.service';
import { WaterPointsController } from './water-points.controller';
import { WaterPoint } from './entities/water-point.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WaterPoint])],
  controllers: [WaterPointsController],
  providers: [WaterPointsService],
})
export class WaterPointsModule { }
