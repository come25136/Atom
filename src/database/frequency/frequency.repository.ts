import { EntityRepository, FindOneOptions } from 'typeorm'

import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { Frequency } from './frequency.entity'

@EntityRepository(Frequency)
export class FrequencyRepository extends BaseRepository<Frequency> {
  async findOneByRemoteUidAndId(): Promise<Frequency> {
    throw new Error(
      'The function cannot be used because there is no ID in Frequency.',
    )
  }

  async findByTripId(
    remoteUid: Remote['uid'],
    tripId: Frequency['tripId'],
    other?: FindOneOptions<Frequency>,
  ): Promise<Frequency[]> {
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

  async findOneByRemoteUidAndTripIdAndStartTimeAndEndTime(
    remoteUid: Remote['uid'],
    tripId: Frequency['tripId'],
    startTime: Frequency['startTime'],
    endTime: Frequency['endTime'],
    other?: FindOneOptions<Frequency>,
  ): Promise<Frequency> {
    return this.findOne({
      ...other,
      where: {
        tripId,
        startTime,
        endTime,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }
}
