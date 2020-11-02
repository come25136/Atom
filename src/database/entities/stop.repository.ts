import { EntityRepository } from 'typeorm'

import { BaseRepository } from './base.repository'
import { Stop } from './stop.entity'

@EntityRepository(Stop)
export class StopRepository extends BaseRepository<Stop> {}
