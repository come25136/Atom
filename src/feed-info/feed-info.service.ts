import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'

import { FeedInfo } from 'src/database/entities/feed_info.entity'
import { FeedInfoRepository } from 'src/database/entities/feed_info.repository'
import { Remote } from 'src/database/entities/remote.entity'
import { Transactional } from 'typeorm-transactional-cls-hooked'

@Injectable()
export class FeedInfoService {
  constructor(private feedInfoRepository: FeedInfoRepository) {}

  create(remoteUid: Remote['uid'], data: GTFS.FeedInfo): FeedInfo {
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
  async save(entities: FeedInfo[], updateEntity = false) {
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
