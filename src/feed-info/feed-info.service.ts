import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common';
import { FeedInfo } from 'src/database/entities/feed_info.entity';
import { FeedInfoRepository } from 'src/database/entities/feed_info.repository';
import { Remote } from 'src/database/entities/remote.entity';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class FeedInfoService {
  constructor(
    private feedInfoRepository: FeedInfoRepository,
  ) { }

  @Transactional()
  async createOrUpdate(remoteUid: Remote['uid'], data: GTFS.FeedInfo): Promise<FeedInfo> {
    const feedInfoEntity =
      await this.feedInfoRepository.findOneByRemoteUidAndPublisherName(remoteUid, data.publisher.name)
      ?? this.feedInfoRepository.create({ publisherName: data.publisher.name })
    feedInfoEntity.publisherUrl = data.publisher.url
    feedInfoEntity.startDate = data.date.start
    feedInfoEntity.endDate = data.date.end
    feedInfoEntity.version = data.version
    feedInfoEntity.contactEmail = data.contact.email
    feedInfoEntity.contactUrl = data.contact.url

    return feedInfoEntity
  }

  @Transactional()
  async save(entities: FeedInfo[]) {
    return this.feedInfoRepository.save(entities)
  }
}
