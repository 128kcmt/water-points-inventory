import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import type { LineString } from 'geojson';

@Entity('roads')
export class Road {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    osm_id: string;

    @Column({ nullable: true })
    code: number;

    @Column({ nullable: true })
    fclass: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    ref: string;

    @Column({ nullable: true })
    oneway: string;

    @Column({ nullable: true })
    maxspeed: number;

    @Column({ nullable: true })
    layer: number;

    @Index({ spatial: true })
    @Column({
        type: 'geometry',
        spatialFeatureType: 'LineString',
        srid: 4326,
        nullable: true,
    })
    geom: LineString;
}
