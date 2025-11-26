import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WaterPointsModule } from './water-points/water-points.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [WaterPointsModule, StatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
