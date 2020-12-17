import * as moment from 'moment'
import { HttpService, Injectable } from '@nestjs/common'
import { Remote } from 'src/database/entities/remote.entity'
import { Transactional } from 'typeorm-transactional-cls-hooked'
import { createHash } from 'crypto'

import {
  FeedType,
  GtfsRealtime,
} from 'src/database/entities/gtfs_realtime.entity'
import { GtfsRealtimeRepository } from 'src/database/entities/gtfs_realtime.repository'

@Injectable()
export class GtfsRealtimeService {
  constructor(
    private gtfsRealtimeRepository: GtfsRealtimeRepository,
    private httpService: HttpService,
  ) {}

  @Transactional()
  async createOrUpdate(
    remoteUid: Remote['uid'],
    feedType: FeedType,
    url: string,
  ): Promise<GtfsRealtime> {
    const { data: pBBuffer } = await this.httpService
      .get<Buffer>(url, {
        responseType: 'arraybuffer',
      })
      .toPromise()
    const pBHash = createHash('sha256')
      .update(pBBuffer)
      .digest('hex')

    const gtfsRTEntity =
      (await this.gtfsRealtimeRepository.findOneByRemoteUidAndFeedType(
        remoteUid,
        feedType,
      )) ?? this.gtfsRealtimeRepository.create({ feedType })
    gtfsRTEntity.url = url
    gtfsRTEntity.hash = pBHash
    gtfsRTEntity.lastAcquisitionDate = moment()

    return gtfsRTEntity
  }
}
