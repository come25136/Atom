import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common';
import { Remote } from 'src/database/entities/remote.entity';
import { Shape } from 'src/database/entities/shape.entity';
import { ShapeRepository } from 'src/database/entities/shape.repository';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class ShapeService {
  constructor(
    private shapeRepository: ShapeRepository,
  ) { }

  @Transactional()
  async createOrUpdate(remoteUid: Remote['uid'], data: GTFS.Shape): Promise<Shape> {
    const shapeEntity =
      await this.shapeRepository.findOneByRemoteUidAndIdAndSequence(remoteUid, data.id, data.sequence)
      ?? this.shapeRepository.create({ id: data.id, sequence: data.sequence })
    shapeEntity.location = data.location
    shapeEntity.distTraveled = data.distTraveled

    return shapeEntity
  }

  @Transactional()
  async save(entities: Shape[]) {
    return this.shapeRepository.save(entities)
  }
}
