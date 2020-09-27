import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedInfo } from 'src/database/entities/feed_info.entity';
import { FeedInfoRepository } from 'src/database/entities/feed_info.repository';
import { FeedInfoService } from './feed-info.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeedInfoRepository])],
  providers: [FeedInfoService],
  exports: [TypeOrmModule]
})
export class FeedInfoModule { }
