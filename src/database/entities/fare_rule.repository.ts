import { EntityRepository } from 'typeorm'

import { BaseRepository } from './base.repository'
import { FareRule } from './fare_rule.entity'

@EntityRepository(FareRule)
export class FareRuleRepository extends BaseRepository<FareRule> {}
