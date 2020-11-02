import { EntityRepository, FindOneOptions } from 'typeorm'
import { BaseRepository } from './base.repository'
import { Remote } from './remote.entity'
import { StopTime } from './stop_time.entity'

@EntityRepository(StopTime)
export class StopTimeRepository extends BaseRepository<StopTime> {
  async findOneByRemoteUidAndId(): Promise<StopTime> {
    throw new Error(
      'The function cannot be used because there is no ID in StopTime.',
    )
  }

  async findOneByRemoteUidAndTripIdAndSequence(
    remoteUid: Remote['uid'],
    tripId: StopTime['tripId'],
    sequence: StopTime['sequence'],
    other?: FindOneOptions<StopTime>,
  ): Promise<StopTime> {
    return this.findOne({
      ...other,
      where: {
        tripId,
        sequence,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }
}
