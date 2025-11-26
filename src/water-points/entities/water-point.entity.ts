import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import type { Point } from 'geojson';

@Entity('water_points')
export class WaterPoint {
    @PrimaryGeneratedColumn()
    fid: number;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    name_en: string;

    @Column({ nullable: true })
    amenity: string;

    @Column({ nullable: true })
    man_made: string;

    @Index({ spatial: true })
    @Column({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    })
    geom: Point;
}
