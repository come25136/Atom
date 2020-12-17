import { EntityRepository, FindOneOptions } from 'typeorm'
import { Transactional } from 'typeorm-transactional-cls-hooked'
import { BaseRepository } from './base.repository'
import { Remote } from './remote.entity'
import { StopTime } from './stop_time.entity'
import { Trip } from './trip.entity'

@EntityRepository(StopTime)
export class StopTimeRepository extends BaseRepository<StopTime> {
  async findOneByRemoteUidAndId(): Promise<StopTime> {
    throw new Error(
      'The function cannot be used because there is no ID in StopTime.',
    )
  }

  async findByTripId(
    remoteUid: Remote['uid'],
    tripId: StopTime['tripId'],
    other?: FindOneOptions<StopTime>,
  ): Promise<StopTime[]> {
    return this.find({
      ...other,
      where: {
        tripId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  async findOneByRemoteUidAndTripId(
    remoteUid: Remote['uid'],
    tripId: StopTime['tripId'],
    sequence?: StopTime['sequence'],
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

  @Transactional()
  async linkTrip(
    remoteUid: Remote['uid'],
    tripUid: Trip['uid'],
    tripId: Trip['id'],
  ) {
    return this.createQueryBuilder()
      .update()
      .set({ trip: { uid: tripUid } })
      .where({ remote: { uid: remoteUid }, tripId })
      .execute()
  }
}
