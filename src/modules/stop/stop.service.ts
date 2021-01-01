import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { Remote } from 'src/database/remote/remote.entity'
import { Stop } from 'src/database/stop/stop.entity'
import { StopRepository } from 'src/database/stop/stop.repository'

@Injectable()
export class StopService {
  constructor(private stopRepository: StopRepository) {}

  create(remoteUid: Remote['uid'], data: GTFS.Stop): Stop {
    const agencyEntity = this.stopRepository.create({ id: data.id })
    agencyEntity.name = data.name
    agencyEntity.code = data.code
    agencyEntity.name = data.name
    agencyEntity.description = data.description
    agencyEntity.location = data.location
    agencyEntity.zoneId = data.zone.id
    agencyEntity.url = data.url
    agencyEntity.locationType = data.location.type
    agencyEntity.parentStation = data.parentStation
    agencyEntity.timezone = data.timezone
    agencyEntity.wheelchairBoarding = data.wheelchairBoarding
    agencyEntity.levelId = data.level.id
    agencyEntity.platformCode = data.platformCode

    return agencyEntity
  }

  @Transactional()
  async save(entities: Stop[], updateEntity = false) {
    return this.stopRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.stopRepository.getUniqueColumns,
        overwrite: [...this.stopRepository.getUniqueColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }
}
