import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { FeedInfo } from 'src/database/tables/feed-info/feed_info.entity'
import { FeedInfoRepository } from 'src/database/tables/feed-info/feed_info.repository'
import { Remote } from 'src/database/tables/remote/remote.entity'

@Injectable()
export class FeedInfoService {
  constructor(private feedInfoRepository: FeedInfoRepository) {}

  create(remoteUid: Remote['uid'], data: any): FeedInfo {
    const feedInfoEntity = this.feedInfoRepository.create({
      publisherName: data.publisher.name,
    })
    feedInfoEntity.publisherUrl = data.publisher.url
    feedInfoEntity.lang = data.lang
    feedInfoEntity.startDate = data.date.start
    feedInfoEntity.endDate = data.date.end
    feedInfoEntity.version = data.version
    feedInfoEntity.contactEmail = data.contact.email
    feedInfoEntity.contactUrl = data.contact.url

    return feedInfoEntity
  }

  @Transactional()
  async bulkUpsert(entities: FeedInfo[], updateEntity = false) {
    return this.feedInfoRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.feedInfoRepository.getUniqueColumns,
        overwrite: [...this.feedInfoRepository.getUniqueColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }
}
