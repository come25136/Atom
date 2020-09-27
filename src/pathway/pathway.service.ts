import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common';
import { Pathway } from 'src/database/entities/pathway.entity';
import { PathwayRepository } from 'src/database/entities/pathway.repository';
import { Remote } from 'src/database/entities/remote.entity';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class PathwayService {
  constructor(
    private pathwayRepository: PathwayRepository,
  ) { }

  @Transactional()
  async createOrUpdate(remoteUid: Remote['uid'], data: GTFS.Pathway): Promise<Pathway> {
    const transferEntity =
      await this.pathwayRepository.findOneByRemoteUidAndId(remoteUid, data.id)
      ?? this.pathwayRepository.create({ id: data.id })
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
  async save(entities: Pathway[]) {
    return this.pathwayRepository.save(entities)
  }
}
