import { ConfigModule, ConfigService } from '@nestjs/config'
import { Module } from '@nestjs/common'

import { GtfsArchiveService } from './gtfs-archive.service'

@Module({
  imports: [ConfigModule],
  providers: [ConfigService, GtfsArchiveService],
})
export class GtfsArchiveModule {}
