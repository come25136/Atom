import { Injectable } from '@nestjs/common';
import * as GTFS from '@come25136/gtfs'
import { Remote } from 'src/database/entities/remote.entity';
import { StopTimeRepository } from 'src/database/entities/stop_time.repository';
import { StopTime } from 'src/database/entities/stop_time.entity';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class StopTimeService {
  constructor(
    private stopTimeRepository: StopTimeRepository,
  ) { }

  @Transactional()
  async createOrUpdate(remoteUid: Remote['uid'], data: GTFS.StopTime): Promise<StopTime> {
    const stopTimeEntity =
      await this.stopTimeRepository.findOneByRemoteUidAndTripIdAndSequence(remoteUid, data.tripId, data.sequence)
      ?? this.stopTimeRepository.create({ tripId: data.tripId, sequence: data.sequence })
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
    return this.stopTimeRepository.save(entities)
  }
}
