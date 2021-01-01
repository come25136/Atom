import { EntityRepository } from 'typeorm'

import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { Stop } from '../stop/stop.entity'
import { Pathway } from './pathway.entity'

@EntityRepository(Pathway)
export class PathwayRepository extends BaseRepository<Pathway> {}
