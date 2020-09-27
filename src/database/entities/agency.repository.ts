import { EntityRepository } from "typeorm";
import { Agency } from "./agency.entity";
import { BaseRepository } from "./base.repository";

@EntityRepository(Agency)
export class AgencyRepository extends BaseRepository<Agency> {
}
