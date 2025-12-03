import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import type { Point } from 'geojson';

@Entity('water_points')
export class WaterPoint {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;





    @Column({ nullable: true })
    status: string;

    @Column({ nullable: true })
    district: string;

    @Column({ type: 'double precision', nullable: true })
    lat: number;

    @Column({ type: 'double precision', nullable: true })
    lon: number;
}
