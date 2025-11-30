import { Controller, Get, Query } from '@nestjs/common';
import { WaterPointsService } from './water-points.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('water-points')
@Controller('api')
export class WaterPointsController {
    constructor(private readonly waterPointsService: WaterPointsService) { }

    @Get('nearest')
    @ApiOperation({ summary: 'Get 5 nearest water points and routes' })
    @ApiQuery({ name: 'lat', required: true, type: Number })
    @ApiQuery({ name: 'lon', required: true, type: Number })
    async getNearest(@Query('lat') lat: number, @Query('lon') lon: number) {
        return this.waterPointsService.findNearest(lat, lon);
    }

    @Get('pop-in-buffer')
    @ApiOperation({ summary: 'Get population in 5km buffer' })
    @ApiQuery({ name: 'lat', required: true, type: Number })
    @ApiQuery({ name: 'lon', required: true, type: Number })
    async getPopulationInBuffer(@Query('lat') lat: number, @Query('lon') lon: number) {
        return this.waterPointsService.getPopulationInBuffer(lat, lon);
    }

    @Get('water-points')
    @ApiOperation({ summary: 'Get all water points' })
    findAll() {
        return this.waterPointsService.findAll();
    }
}