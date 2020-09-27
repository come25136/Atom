import { EntityRepository } from "typeorm";
import { BaseRepository } from "./base.repository";
import { GtfsStatic } from "./gtfs_static.entity";

@EntityRepository(GtfsStatic)
export class GtfsStaticRepository extends BaseRepository<GtfsStatic> {
}
