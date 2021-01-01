import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { Remote } from 'src/database/tables/remote/remote.entity'
import { Trip } from 'src/database/tables/trip/trip.entity'
import { TripRepository } from 'src/database/tables/trip/trip.repository'

@Injectable()
export class TripService {
  constructor(private tripRepository: TripRepository) {}

  create(remoteUid: Remote['uid'], data: GTFS.Trip): Trip {
    const tripEntity = this.tripRepository.create({ id: data.id })
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
  async getUidOnly(remoteUid: Remote['uid'], id: Trip['id']) {
    const shapes = await this.tripRepository.findOneByRemoteUidAndId(
      remoteUid,
      id,
      {
        select: ['uid'],
      },
    )

    return shapes
  }

  @Transactional()
  async save(entities: Trip[], updateEntity = false) {
    return this.tripRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.tripRepository.getUniqueColumns,
        overwrite: [...this.tripRepository.getUniqueColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }
}
