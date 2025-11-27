import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WaterPoint } from './entities/water-point.entity';

@Injectable()
export class WaterPointsService {
    constructor(
        @InjectRepository(WaterPoint)
        private waterPointsRepository: Repository<WaterPoint>,
    ) { }

    async findAll(): Promise<WaterPoint[]> {
        return this.waterPointsRepository.find({
            take: 100, // Limit to 100 for performance
        });
    }
}
