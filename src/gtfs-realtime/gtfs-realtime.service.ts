import { Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { Remote } from 'src/database/entities/remote.entity';
import { createHash } from 'crypto';
import * as moment from 'moment'
import axios from 'axios'
import { FeedType, GtfsRealtime } from 'src/database/entities/gtfs_realtime.entity';
import { GtfsRealtimeRepository } from 'src/database/entities/gtfs_realtime.repository';

@Injectable()
export class GtfsRealtimeService {
  constructor(
    private gtfsRealtimeRepository: GtfsRealtimeRepository,
  ) { }

  @Transactional()
  async createOrUpdate(remoteUid: Remote['uid'], feedType: FeedType, url: string): Promise<GtfsRealtime> {
    const { data: pBBuffer } = await axios.get(url, { responseType: 'arraybuffer' })
    const pBHash = createHash('sha256').update(pBBuffer).digest('hex')

    const gtfsRTEntity =
      await this.gtfsRealtimeRepository.findOneByRemoteUidAndFeedType(remoteUid, feedType)
      ?? this.gtfsRealtimeRepository.create({ feedType })
    gtfsRTEntity.url = url
    gtfsRTEntity.hash = pBHash
    gtfsRTEntity.lastAcquisitionDate = moment()

    return gtfsRTEntity
  }
}
