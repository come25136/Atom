import { EntityRepository } from "typeorm";
import { BaseRepository } from "./base.repository";
import { Pathway } from "./pathway.entity";

@EntityRepository(Pathway)
export class PathwayRepository extends BaseRepository<Pathway> {
}
