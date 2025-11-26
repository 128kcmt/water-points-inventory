import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { MultiPolygon } from 'geojson';

@Entity('adm')
export class Adm {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    adm1_en: string;

    @Column({ nullable: true })
    adm1_pcode: string;

    @Index({ spatial: true })
    @Column({
        type: 'geometry',
        spatialFeatureType: 'MultiPolygon',
        srid: 4326,
        nullable: true,
    })
    geom: MultiPolygon;
}
