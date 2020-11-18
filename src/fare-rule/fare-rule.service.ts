import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'

import { FareRule } from 'src/database/entities/fare_rule.entity'
import { FareRuleRepository } from 'src/database/entities/fare_rule.repository'
import { Remote } from 'src/database/entities/remote.entity'
import { Transactional } from 'typeorm-transactional-cls-hooked'

@Injectable()
export class FareRuleService {
  constructor(private fareRuleRepository: FareRuleRepository) { }

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
      .orUpdate({
        conflict_target: this.fareRuleRepository.getColumns,
        overwrite: [...this.fareRuleRepository.getColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }

  @Transactional()
  async findByRmoteUidAndRouteId_GetUidsOnly(remoteUid: Remote['uid'], routeId: FareRule['originId']) {
    return this.fareRuleRepository.find({
      select: ['uid'],
      where: {
        routeId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  @Transactional()
  async findByRmoteUidAndTripId_GetUidsOnly(remoteUid: Remote['uid'], tripId: FareRule['originId']) {
    return this.fareRuleRepository.find({
      select: ['uid'],
      where: {
        tripId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  @Transactional()
  async findByRmoteUidAndOriginId_GetUidsOnly(remoteUid: Remote['uid'], originId: FareRule['originId']) {
    return this.fareRuleRepository.find({
      select: ['uid'],
      where: {
        originId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  @Transactional()
  async findByRmoteUidAndDestinationId_GetUidsOnly(remoteUid: Remote['uid'], destinationId: FareRule['destinationId']) {
    return this.fareRuleRepository.find({
      select: ['uid'],
      where: {
        destinationId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  @Transactional()
  async findByRmoteUidAndContainId_GetUidsOnly(remoteUid: Remote['uid'], containId: FareRule['containId']) {
    return this.fareRuleRepository.find({
      select: ['uid'],
      where: {
        containId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }
}
