import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { Remote } from 'src/database/tables/remote/remote.entity'
import { Shape } from 'src/database/tables/shape/shape.entity'
import { ShapeRepository } from 'src/database/tables/shape/shape.repository'
import { Trip } from 'src/database/tables/trip/trip.entity'

@Injectable()
export class ShapeService {
  constructor(private shapeRepository: ShapeRepository) { }

  create(remoteUid: Remote['uid'], data: GTFS.Shape, caled = false): Shape {
    const shapeEntity = this.shapeRepository.create({
      id: data.id,
      sequence: data.sequence,
      location: data.location,
      distTraveled: data.distTraveled,
      caled,
    })

    return shapeEntity
  }

  @Transactional()
  async getUidsOnly(remoteUid: Remote['uid'], id: Shape['id']) {
    const shapes = await this.shapeRepository.findByRemoteUidAndId(
      remoteUid,
      id,
      {
        select: ['uid'],
      },
    )

    return shapes
  }

  @Transactional()
  async saves(entities: Shape[]) {
    return this.shapeRepository.save(entities)
  }

  @Transactional()
  async bulkUpsert(entities: Shape[], updateEntity = false) {
    return this.shapeRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.shapeRepository.getUniqueColumns,
        overwrite: [...this.shapeRepository.getUniqueColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }

  @Transactional()
  async findOneByUid(
    uid: Shape['uid'],
    relations: (keyof Shape | string)[] = [],
  ) {
    return this.shapeRepository.findOne({
      relations,
      where: {
        uid,
      },
    })
  }

  @Transactional()
  async findByRemoteUidAndId(
    remoteUid: Remote['uid'],
    shapeId: Shape['id'],
    order: 'ASC' | 'DESC' = 'ASC',
  ) {
    return this.shapeRepository.findByRemoteUidAndId(remoteUid, shapeId, {
      order: { sequence: order },
    })
  }
}
