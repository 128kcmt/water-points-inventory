import { Module } from '@nestjs/common';
import { RoadsService } from './roads.service';
import { RoadsController } from './roads.controller';

@Module({
  providers: [RoadsService],
  controllers: [RoadsController]
})
export class RoadsModule {}
