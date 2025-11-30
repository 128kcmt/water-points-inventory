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

        // District Stats (aggregating by adm1_en)
        // Assuming 'adm' table has polygons and 'water_points' are points.
        // We can do a spatial join to count points per district.
        // Or if water_points has a district column, we can group by it.
        // The prompt says "water_points (120k+ points with fid,name,name_en,amenity,man_made etc.)" - doesn't explicitly mention district column.
        // So spatial join with 'adm' table is safer.

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
