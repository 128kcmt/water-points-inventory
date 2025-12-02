import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WaterPoint } from './entities/water-point.entity';

@Injectable()
export class WaterPointsService implements OnModuleInit {
    private readonly logger = new Logger(WaterPointsService.name);

    constructor(
        @InjectRepository(WaterPoint)
        private waterPointsRepository: Repository<WaterPoint>,
        private dataSource: DataSource,
    ) { }

    async onModuleInit() {
        await this.checkAndFixTopology();
    }

    private async checkAndFixTopology() {
        try {
            this.logger.log('Checking network topology...');

            // Check if we have roads with null source/target
            const unlinkedRoads = await this.dataSource.query(
                `SELECT COUNT(*) as count FROM water_points_inventory.roads 
                 WHERE source IS NULL OR target IS NULL`
            );

            if (parseInt(unlinkedRoads[0].count) > 0) {
                this.logger.warn(`Found ${unlinkedRoads[0].count} unlinked roads. Fixing topology... (this may take a while)`);

                // 1. Update source IDs (Start Point)
                await this.dataSource.query(`
                    UPDATE water_points_inventory.roads r
                    SET source = v.id
                    FROM water_points_inventory.roads_vertices_pgr v
                    WHERE r.source IS NULL
                    AND v.id = (
                        SELECT id FROM water_points_inventory.roads_vertices_pgr
                        ORDER BY geom <-> ST_StartPoint(r.geom) LIMIT 1
                    )
                `);

                // 2. Update target IDs (End Point)
                await this.dataSource.query(`
                    UPDATE water_points_inventory.roads r
                    SET target = v.id
                    FROM water_points_inventory.roads_vertices_pgr v
                    WHERE r.target IS NULL
                    AND v.id = (
                        SELECT id FROM water_points_inventory.roads_vertices_pgr
                        ORDER BY geom <-> ST_EndPoint(r.geom) LIMIT 1
                    )
                `);

                this.logger.log('Topology links updated.');
            }

            // Check costs
            const nullCosts = await this.dataSource.query(
                `SELECT COUNT(*) as count FROM water_points_inventory.roads 
                 WHERE cost IS NULL OR reverse_cost IS NULL`
            );

            if (parseInt(nullCosts[0].count) > 0) {
                this.logger.log('Updating road costs...');
                await this.dataSource.query(`
                    UPDATE water_points_inventory.roads
                    SET 
                        cost = ST_Length(geom::geography),
                        reverse_cost = ST_Length(geom::geography)
                    WHERE cost IS NULL OR reverse_cost IS NULL
                `);
                this.logger.log('Road costs updated.');
            }

            this.logger.log('Network topology check complete.');
        } catch (error) {
            this.logger.error('Error fixing topology:', error);
        }
    }

    /**
     * Find nearest road vertex to a given point
     * @param lat Latitude
     * @param lon Longitude
     * @returns Vertex ID or null
     */
    private async findNearestVertex(lat: number, lon: number): Promise<number | null> {
        try {
            const result = await this.dataSource.query(
                `SELECT v.id
                 FROM water_points_inventory.roads_vertices_pgr v
                 ORDER BY v.geom <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
                 LIMIT 1`,
                [lon, lat]
            );

            return result && result[0] ? result[0].id : null;
        } catch (error) {
            console.error('Error finding nearest vertex:', error);
            return null;
        }
    }

    /**
     * Get route geometry from pgRouting
     * @param originLat Origin latitude
     * @param originLon Origin longitude
     * @param destLat Destination latitude
     * @param destLon Destination longitude
     * @returns GeoJSON LineString or null if routing fails
     */
    private async getRouteFromPgRouting(
        originLat: number,
        originLon: number,
        destLat: number,
        destLon: number,
    ): Promise<any> {
        try {
            // Find nearest vertices
            const startVertex = await this.findNearestVertex(originLat, originLon);
            const endVertex = await this.findNearestVertex(destLat, destLon);

            if (!startVertex || !endVertex) {
                console.warn('Could not find nearest vertices for routing');
                return null;
            }

            // Get route using pgRouting
            console.log(`Attempting route from vertex ${startVertex} to ${endVertex}`);

            // First check if a route exists and get count
            const routeExists = await this.dataSource.query(
                `SELECT count(*) FROM pgr_dijkstra(
                   'SELECT id, source, target, cost, reverse_cost 
                    FROM water_points_inventory.roads
                    WHERE source IS NOT NULL AND target IS NOT NULL',
                   $1::BIGINT, $2::BIGINT, false
                 )`,
                [startVertex, endVertex]
            );

            const edgeCount = parseInt(routeExists[0].count);
            console.log(`pgr_dijkstra found ${edgeCount} edges`);

            if (edgeCount === 0) {
                console.warn(`✗ No route found from vertex ${startVertex} to ${endVertex}`);
                return null;
            }

            const result = await this.dataSource.query(
                `SELECT ST_AsGeoJSON(ST_LineMerge(ST_Union(r.geom)))::json AS geojson
                 FROM pgr_dijkstra(
                   'SELECT id, source, target, cost, reverse_cost 
                    FROM water_points_inventory.roads
                    WHERE source IS NOT NULL AND target IS NOT NULL',
                   $1::BIGINT, $2::BIGINT, false
                 ) AS d
                 JOIN water_points_inventory.roads r ON d.edge = r.id`,
                [startVertex, endVertex]
            );

            if (result && result[0] && result[0].geojson) {
                console.log(`✓ Route found from ${startVertex} to ${endVertex}`);
                return result[0].geojson;
            }

            console.warn(`✗ No route found from vertex ${startVertex} to ${endVertex}`);
            return null;
        } catch (error) {
            console.error('Error fetching route from pgRouting:', error);
            return null;
        }
    }

    async findNearest(lat: number, lon: number): Promise<any> {
        // Find 5 nearest water points using lat/lon columns
        const nearestPoints = await this.waterPointsRepository
            .createQueryBuilder('wp')
            .select([
                'wp.id',
                'wp.name',
                'wp.status',
                'wp.district',
                'wp.lat',
                'wp.lon',
                `ST_Distance(
                    ST_SetSRID(ST_MakePoint(wp.lon, wp.lat), 4326)::geography, 
                    ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography
                ) as distance`,
            ])
            .setParameter('lon', lon)
            .setParameter('lat', lat)
            .orderBy('distance', 'ASC')
            .limit(5)
            .getRawMany();

        // Fetch routes for each nearest point using pgRouting
        const pointsWithRoutes = await Promise.all(
            nearestPoints.map(async (point) => {
                const route = await this.getRouteFromPgRouting(
                    lat,
                    lon,
                    parseFloat(point.wp_lat),
                    parseFloat(point.wp_lon),
                );

                return {
                    ...point,
                    geom: { type: 'Point', coordinates: [point.wp_lon, point.wp_lat] },
                    route: route, // GeoJSON LineString or null
                };
            }),
        );

        return pointsWithRoutes;
    }

    async getPopulationInBuffer(lat: number, lon: number): Promise<any> {
        const bufferRadius = 5000; // 5km

        const pointsInBuffer = await this.waterPointsRepository
            .createQueryBuilder('wp')
            .select('COUNT(wp.id)', 'count')
            .where(
                `ST_DWithin(
          ST_SetSRID(ST_MakePoint(wp.lon, wp.lat), 4326)::geography,
          ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
          :radius
        )`,
                { lon, lat, radius: bufferRadius },
            )
            .getRawOne();

        const populationResult = await this.dataSource.query(
            `
            WITH buffer_geom AS (
                SELECT ST_SetSRID(ST_Buffer(ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)::geometry, 4326) as geom
            )
            SELECT SUM((ST_SummaryStats(ST_Clip(rast, buffer_geom.geom))).sum) as population
            FROM water_points_inventory.population_raster, buffer_geom
            WHERE ST_Intersects(rast, buffer_geom.geom)
            `,
            [lon, lat, bufferRadius]
        );

        const population = populationResult[0]?.population || 0;

        return {
            lat,
            lon,
            bufferRadius,
            waterPointsCount: parseInt(pointsInBuffer.count, 10),
            population: Math.round(population),
        };
    }

    async findAll(): Promise<WaterPoint[]> {
        return this.waterPointsRepository.find({
            take: 1000, // Limit to 1000 for performance
        });
    }
}
