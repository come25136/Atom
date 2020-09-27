import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common';
import { Frequency } from 'src/database/entities/frequency.entity';
import { FrequencyRepository } from 'src/database/entities/frequency.repository';
import { Remote } from 'src/database/entities/remote.entity';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class FrequencyService {
  constructor(
    private frequencyRepository: FrequencyRepository,
  ) { }

  @Transactional()
  async createOrUpdate(remoteUid: Remote['uid'], data: GTFS.Frequency): Promise<Frequency> {
    const frequencyEntity =
      await this.frequencyRepository.findOneByRemoteUidAndTripIdAndStartTimeAndEndTime(remoteUid, data.tripId, data.time.start, data.time.end)
      ?? this.frequencyRepository.create({ tripId: data.tripId, startTime: data.time.start, endTime: data.time.end })
    frequencyEntity.headwaySecs = data.headwaySecs
    frequencyEntity.exactTimes = data.exactTimes

    return frequencyEntity
  }

  @Transactional()
  async save(entities: Frequency[]) {
    return this.frequencyRepository.save(entities)
  }
}
