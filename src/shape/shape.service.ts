import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Remote } from 'src/database/entities/remote.entity'
import { Shape } from 'src/database/entities/shape.entity'
import { ShapeRepository } from 'src/database/entities/shape.repository'
import { Transactional } from 'typeorm-transactional-cls-hooked'

@Injectable()
export class ShapeService {
  constructor(private shapeRepository: ShapeRepository) {}

  create(remoteUid: Remote['uid'], data: GTFS.Shape): Shape {
    const shapeEntity = this.shapeRepository.create({
      id: data.id,
      sequence: data.sequence,
    })
    shapeEntity.location = data.location
    shapeEntity.distTraveled = data.distTraveled

    return shapeEntity
  }

  @Transactional()
  async save(entities: Shape[], updateEntity = false) {
    return this.shapeRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({ overwrite: this.shapeRepository.getColumns })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }
}
