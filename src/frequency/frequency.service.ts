import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'

import { Frequency } from 'src/database/entities/frequency.entity'
import { FrequencyRepository } from 'src/database/entities/frequency.repository'
import { Remote } from 'src/database/entities/remote.entity'
import { Transactional } from 'typeorm-transactional-cls-hooked'

@Injectable()
export class FrequencyService {
  constructor(private frequencyRepository: FrequencyRepository) { }

  create(remoteUid: Remote['uid'], data: GTFS.Frequency): Frequency {
    const frequencyEntity = this.frequencyRepository.create({
      tripId: data.tripId,
      startTime: data.time.start,
      endTime: data.time.end,
    })
    frequencyEntity.headwaySecs = data.headwaySecs
    frequencyEntity.exactTimes = data.exactTimes

    return frequencyEntity
  }

  @Transactional()
  async save(entities: Frequency[], updateEntity = false) {
    return this.frequencyRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.frequencyRepository.getColumns,
        overwrite: [...this.frequencyRepository.getColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }

  @Transactional()
  async getUidsOnly(remoteUId: Remote['uid'], tripId: Frequency['tripId']) {
    const frequency = await this.frequencyRepository.findByTripId(remoteUId, tripId, {
      select: ['uid']
    })

    return frequency
  }
}
