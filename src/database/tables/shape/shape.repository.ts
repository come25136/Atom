import { EntityRepository, FindOneOptions } from 'typeorm'

import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { Trip } from '../trip/trip.entity'
import { Shape } from './shape.entity'

@EntityRepository(Shape)
export class ShapeRepository extends BaseRepository<Shape> {
  async findByRemoteUidAndId(
    remoteUid: Remote['uid'],
    id: Shape['id'],
    other?: FindOneOptions<Shape>,
  ): Promise<Shape[]> {
    return this.find({
      ...other,
      where: {
        id,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  async findOneByRemoteUidAndIdAndSequence(
    remoteUid: Remote['uid'],
    id: Shape['id'],
    sequence: Shape['sequence'],
    other?: FindOneOptions<Shape>,
  ): Promise<Shape> {
    return this.findOne({
      ...other,
      where: {
        id,
        sequence,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }
}
