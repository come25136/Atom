import * as dayjs from 'dayjs'
import { HttpService, Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'
import { createHash } from 'crypto'

import {
  FeedType,
  GtfsRealtime,
} from 'src/database/tables/gtfs-realtime/gtfs_realtime.entity'
import { GtfsRealtimeRepository } from 'src/database/tables/gtfs-realtime/gtfs_realtime.repository'
import { Remote } from 'src/database/tables/remote/remote.entity'

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
    gtfsRTEntity.latestFetchedHash = pBHash
    gtfsRTEntity.latestFetchedDate = dayjs()

    return gtfsRTEntity
  }

  @Transactional()
  async findOneByRemoteUidAndFeedType(
    remoteUid: Remote['uid'],
    feedType: FeedType,
  ): Promise<GtfsRealtime> {
    return this.gtfsRealtimeRepository.findOne({
      where: {
        remote: {
          uid: remoteUid,
        },
        feedType,
      },
    })
  }
}
