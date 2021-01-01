import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { Pathway } from 'src/database/pathway/pathway.entity'
import { PathwayRepository } from 'src/database/pathway/pathway.repository'
import { Remote } from 'src/database/remote/remote.entity'

@Injectable()
export class PathwayService {
  constructor(private pathwayRepository: PathwayRepository) {}

  create(remoteUid: Remote['uid'], data: GTFS.Pathway): Pathway {
    const transferEntity = this.pathwayRepository.create({ id: data.id })
    transferEntity.fromStopId = data.from.stop.id
    transferEntity.toStopId = data.from.stop.id
    transferEntity.pathwayMode = data.pathwayMode
    transferEntity.isBidirectional = data.isBidirectional
    transferEntity.length = data.length
    transferEntity.traversalTime = data.traversalTime
    transferEntity.stairCount = data.stair.count
    transferEntity.maxSlope = data.slope.max
    transferEntity.minWidth = data.width.min
    transferEntity.signpostedAs = data.signpostedAs
    transferEntity.reversedSignpostedAs = data.reversedSignpostedAs

    return transferEntity
  }

  @Transactional()
  async save(entities: Pathway[], updateEntity = false) {
    return this.pathwayRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.pathwayRepository.getUniqueColumns,
        overwrite: [...this.pathwayRepository.getUniqueColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }

  @Transactional()
  async findByRmoteUidAndFromStopId_GetUidsOnly(
    remoteUid: Remote['uid'],
    fromStopId: Pathway['fromStopId'],
  ) {
    return this.pathwayRepository.find({
      select: ['uid'],
      where: {
        fromStopId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  @Transactional()
  async findByRmoteUidAndToStopId_GetUidsOnly(
    remoteUid: Remote['uid'],
    toStopId: Pathway['toStopId'],
  ) {
    return this.pathwayRepository.find({
      select: ['uid'],
      where: {
        toStopId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }
}
