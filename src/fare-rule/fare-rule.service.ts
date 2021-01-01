import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { FindManyOptions } from 'typeorm'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { FareRule } from 'src/database/fare-rule/fare_rule.entity'
import { FareRuleRepository } from 'src/database/fare-rule/fare_rule.repository'
import { Remote } from 'src/database/remote/remote.entity'

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
      .orUpdate({
        conflict_target: this.fareRuleRepository.getUniqueColumns,
        overwrite: [...this.fareRuleRepository.getUniqueColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }

  @Transactional()
  async findByRmoteUidAndRouteId_GetUidsOnly(
    remoteUid: Remote['uid'],
    routeId: FareRule['routeId'],
  ) {
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
  originCount(
    remoteUid: Remote['uid'],
    originId: FareRule['originId'],
  ): Promise<number> {
    return this.fareRuleRepository.count({
      where: {
        remote: {
          uid: remoteUid,
        },
        originId,
      },
    })
  }

  @Transactional()
  async findByRmoteUidAndOriginId_GetUidsOnly(
    remoteUid: Remote['uid'],
    originId: FareRule['originId'],
    other?: Pick<FindManyOptions<this>, 'skip' | 'take'>,
  ) {
    return this.fareRuleRepository.findByRmoteUidAndOriginId(
      remoteUid,
      originId,
      { ...other, select: ['uid'] },
    )
  }

  @Transactional()
  async linkOrigin(...args: Parameters<FareRuleRepository['linkOrigin']>) {
    return this.fareRuleRepository.linkOrigin(...args)
  }

  @Transactional()
  async linkDestination(
    ...args: Parameters<FareRuleRepository['linkDestination']>
  ) {
    return this.fareRuleRepository.linkDestination(...args)
  }

  @Transactional()
  async linkContain(...args: Parameters<FareRuleRepository['linkContain']>) {
    return this.fareRuleRepository.linkContain(...args)
  }

  @Transactional()
  destinationCount(
    remoteUid: Remote['uid'],
    destinationId: FareRule['destinationId'],
  ): Promise<number> {
    return this.fareRuleRepository.count({
      where: {
        remote: {
          uid: remoteUid,
        },
        destinationId,
      },
    })
  }

  @Transactional()
  async findByRmoteUidAndDestinationId_GetUidsOnly(
    remoteUid: Remote['uid'],
    destinationId: FareRule['destinationId'],
    other?: FindManyOptions<this>,
  ) {
    return this.fareRuleRepository.find({
      ...other,
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
  async findByRmoteUidAndContainId_GetUidsOnly(
    remoteUid: Remote['uid'],
    containId: FareRule['containId'],
  ) {
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
