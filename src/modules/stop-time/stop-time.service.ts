import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { Remote } from 'src/database/tables/remote/remote.entity'
import { StopTime } from 'src/database/tables/stop-time/stop_time.entity'
import { StopTimeRepository } from 'src/database/tables/stop-time/stop_time.repository'

@Injectable()
export class StopTimeService {
  constructor(private stopTimeRepository: StopTimeRepository) {}

  create(remoteUid: Remote['uid'], data: GTFS.StopTime): StopTime {
    const stopTimeEntity = this.stopTimeRepository.create({
      tripId: data.tripId,
      sequence: data.sequence,
    })
    stopTimeEntity.tripId = data.tripId
    stopTimeEntity.arrivalTime = data.time.arrival
    stopTimeEntity.departureTime = data.time.departure
    stopTimeEntity.stopId = data.stopId
    stopTimeEntity.headsign = data.headsign
    stopTimeEntity.pickupType = data.pickupType
    stopTimeEntity.dropOffType = data.dropOffType
    stopTimeEntity.shapeDistTraveled = data.shapeDistTraveled
    stopTimeEntity.timepoint = data.timepoint

    return stopTimeEntity
  }

  @Transactional()
  async save(entities: StopTime[]) {
    return this.stopTimeRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.stopTimeRepository.getUniqueColumns,
        overwrite: [...this.stopTimeRepository.getUniqueColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(false)
      .execute()
  }

  @Transactional()
  async linkStop(...args: Parameters<StopTimeRepository['linkStop']>) {
    return this.stopTimeRepository.linkStop(...args)
  }

  @Transactional()
  async findByRmoteUidAndStopId_GetUidsOnly(
    remoteUid: Remote['uid'],
    stopId: StopTime['stopId'],
  ) {
    return this.stopTimeRepository.find({
      where: {
        stopId,
        remote: {
          uid: remoteUid,
        },
      },
      take: 0,
    })
  }

  @Transactional()
  async linkTrip(...args: Parameters<StopTimeRepository['linkTrip']>) {
    return this.stopTimeRepository.linkTrip(...args)
  }
}
