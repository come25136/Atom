import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'

import { FareRule } from 'src/database/entities/fare_rule.entity'
import { FareRuleRepository } from 'src/database/entities/fare_rule.repository'
import { Remote } from 'src/database/entities/remote.entity'
import { Transactional } from 'typeorm-transactional-cls-hooked'

@Injectable()
export class FareRuleService {
  constructor(private fareRuleRepository: FareRuleRepository) {}

  create(
    remoteUid: Remote['uid'],
    data: { id: GTFS.FareRule['fareId'] } & Omit<GTFS.FareRule, 'fareId'>,
  ): FareRule {
    const fareRuleEntity = this.fareRuleRepository.create({ id: data.id })
    fareRuleEntity.routeId = data.routeId
    fareRuleEntity.originId = data.originId
    fareRuleEntity.destinationId = data.destinationId
    fareRuleEntity.containId = data.containsId

    return fareRuleEntity
  }

  @Transactional()
  async save(entities: FareRule[], updateEntity = false) {
    return this.fareRuleRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({ overwrite: this.fareRuleRepository.getColumns })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }
}
