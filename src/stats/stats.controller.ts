import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('stats')
@Controller('api')
export class StatsController {
    constructor(private readonly statsService: StatsService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get national and district statistics' })
    async getStats() {
        return this.statsService.getStats();
    }
}
