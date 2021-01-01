import { EntityRepository, FindOneOptions } from 'typeorm'

import { BaseRepository } from '../base/base.repository'
import { FeedInfo } from './feed_info.entity'
import { Remote } from '../remote/remote.entity'

@EntityRepository(FeedInfo)
export class FeedInfoRepository extends BaseRepository<FeedInfo> {
  async findOneByRemoteUidAndId(): Promise<FeedInfo> {
    throw new Error(
      'The function cannot be used because there is no ID in StopTime.',
    )
  }

  async findOneByRemoteUidAndPublisherName(
    remoteUid: Remote['uid'],
    publisherName: FeedInfo['publisherName'],
    other?: FindOneOptions<FeedInfo>,
  ): Promise<FeedInfo> {
    return this.findOne({
      ...other,
      where: {
        publisherName,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }
}
