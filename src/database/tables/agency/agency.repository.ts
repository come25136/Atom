import { EntityRepository } from 'typeorm'

import { Agency } from './agency.entity'
import { BaseRepository } from '../base/base.repository'

@EntityRepository(Agency)
export class AgencyRepository extends BaseRepository<Agency> {}
