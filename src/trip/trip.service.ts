import * as GTFS from '@come25136/gtfs';
import { Injectable } from '@nestjs/common';
import { Remote } from 'src/database/entities/remote.entity';
import { Trip } from 'src/database/entities/trip.entity';
import { TripRepository } from 'src/database/entities/trip.repository';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class TripService {
  constructor(
    private tripRepository: TripRepository,
  ) { }

  @Transactional()
  async createOrUpdate(remoteUid: Remote['uid'], data: GTFS.Trip): Promise<Trip> {
    const tripEntity =
      await this.tripRepository.findOneByRemoteUidAndId(remoteUid, data.id)
      ?? this.tripRepository.create({ id: data.id })
    tripEntity.routeId = data.routeId
    tripEntity.serviceId = data.serviceId
    tripEntity.headsign = data.headsign
    tripEntity.shortName = data.shortName
    tripEntity.directionId = data.directionId
    tripEntity.blockId = data.blockId
    tripEntity.shapeId = data.shapeId
    tripEntity.wheelchairSccessible = data.wheelchairSccessible
    tripEntity.bikesSllowed = data.bikesSllowed

    return tripEntity
  }

  @Transactional()
  async save(entities: Trip[]) {
    return this.tripRepository.save(entities)
  }
}
