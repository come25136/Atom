import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { FeedInfoRepository } from 'src/database/entities/feed_info.repository'
import { FeedInfoService } from './feed-info.service'

@Module({
  imports: [TypeOrmModule.forFeature([FeedInfoRepository])],
  providers: [FeedInfoService],
  exports: [TypeOrmModule],
})
export class FeedInfoModule {}
