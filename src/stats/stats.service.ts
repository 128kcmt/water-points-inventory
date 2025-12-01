import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WaterPoint } from '../water-points/entities/water-point.entity';

@Injectable()
export class StatsService {
    constructor(
        @InjectRepository(WaterPoint)
        private waterPointsRepository: Repository<WaterPoint>,
    ) { }

    async getStats(): Promise<any> {
        // National Stats
        const totalWaterPoints = await this.waterPointsRepository.count();

        // District Stats (aggregating by district column)
        const districtStats = await this.waterPointsRepository
            .createQueryBuilder('wp')
            .select('wp.district', 'district')
            .addSelect('COUNT(wp.id)', 'count')
            .where('wp.district IS NOT NULL')
            .groupBy('wp.district')
            .getRawMany();

        return {
            national: {
                totalWaterPoints,
            },
            byDistrict: districtStats.map(stat => ({
                district: stat.district,
                count: parseInt(stat.count, 10),
            })),
        };
    }
}
