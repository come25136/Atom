import * as dayjs from 'dayjs'
import { EntityRepository, FindOneOptions, In } from 'typeorm'

import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { Stop } from '../stop/stop.entity'
import { Trip } from '../trip/trip.entity'
import { StopTime } from './stop_time.entity'

@EntityRepository(StopTime)
export class StopTimeRepository extends BaseRepository<StopTime> {
  async findOneByRemoteUidAndId(): Promise<StopTime> {
    throw new Error(
      'The function cannot be used because there is no ID in StopTime.',
    )
  }

  async linkStop(
    remoteUid: Remote['uid'],
    stopUid: Stop['uid'],
    stopId: Stop['id'],
  ) {
    return this.createQueryBuilder()
      .update()
      .set({ stop: { uid: stopUid } })
      .where({ remote: { uid: remoteUid }, stopId })
      .execute()
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

  async findOneByRemoteUidAndTripUid(
    remoteUid: Remote['uid'],
    tripUid: Trip['uid'],
    other?: FindOneOptions<StopTime>,
  ): Promise<StopTime> {
    return this.findOne({
      ...other,
      where: {
        remote: {
          uid: remoteUid,
        },
        trip: {
          uid: tripUid,
        },
      },
    })
  }

  async findByRemoteUidAndTripUid(
    remoteUid: Remote['uid'],
    tripUid: Trip['uid'],
    orderBy: 'ASC' | 'DESC' = 'ASC',
    other?: FindOneOptions<StopTime>,
  ): Promise<StopTime[]> {
    return this.find({
      ...other,
      where: {
        remote: {
          uid: remoteUid,
        },
        trip: {
          uid: tripUid,
        },
      },
      order: {
        sequence: orderBy,
      },
    })
  }

  async findOneByRemoteUidAndTripId(
    remoteUid: Remote['uid'],
    tripId: Trip['id'],
    sequence?: StopTime['sequence'],
    other?: FindOneOptions<StopTime>,
  ): Promise<StopTime> {
    return this.findOne({
      ...other,
      where: {
        remote: {
          uid: remoteUid,
        },
        tripId,
        sequence,
      },
    })
  }

  async findOneByRemoteUidsAndTripUidsAndTime(
    remoteUid: Remote['uid'],
    tripUids: Trip['uid'][],
    time: {
      arrivalTime?: dayjs.Dayjs
      departureTime?: dayjs.Dayjs
    },
    sequence?: StopTime['sequence'],
    relations?: (keyof StopTime)[], // NOTE: リレーション内をソートできないとか問題があるのでよく検討して使う
  ): Promise<StopTime> {
    return this.findOne({
      relations,
      where: {
        remote: {
          uid: remoteUid,
        },
        tripId: In(tripUids),
        sequence,
        arrivalTime: time?.arrivalTime,
        departureTime: time?.departureTime,
      },
    })
  }

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

  async findOneByRemoteUidAndTripUidAndSequence(
    remoteUid: Remote['uid'],
    tripUid: Trip['uid'],
    sequence: StopTime['sequence'],
  ) {
    return this.findOne({
      relations: ['stop'],
      where: {
        remote: {
          uid: remoteUid,
        },
        trip: {
          uid: tripUid,
        },
        sequence,
      },
    })
  }
}
