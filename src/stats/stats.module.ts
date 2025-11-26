import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Adm } from '../adm/entities/adm.entity';
import { WaterPoint } from '../water-points/entities/water-point.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Adm, WaterPoint])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule { }
