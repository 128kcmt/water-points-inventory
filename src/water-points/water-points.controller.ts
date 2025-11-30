import { Controller, Get } from '@nestjs/common';
import { WaterPointsService } from './water-points.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('water-points')
@Controller('api')
export class WaterPointsController {
    constructor(private readonly waterPointsService: WaterPointsService) { }

    @Get('water-points')
    @ApiOperation({ summary: 'Get all water points' })
    findAll() {
        return this.waterPointsService.findAll();
    }
}
