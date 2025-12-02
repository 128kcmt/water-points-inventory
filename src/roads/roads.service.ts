import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class RoadsService {
    constructor(private dataSource: DataSource) { }

    async getSchema() {
        return this.dataSource.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'roads'",
        );
    }
}
