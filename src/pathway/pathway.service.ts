import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Pathway } from 'src/database/entities/pathway.entity'
import { PathwayRepository } from 'src/database/entities/pathway.repository'
import { Remote } from 'src/database/entities/remote.entity'
import { Transactional } from 'typeorm-transactional-cls-hooked'

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
      .orUpdate({ overwrite: this.pathwayRepository.getColumns })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }
}
