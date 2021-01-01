import { ConfigModule, ConfigService } from '@nestjs/config'
import { HttpModule, Module } from '@nestjs/common'

import { GtfsArchiveService } from './gtfs-archive.service'

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [ConfigService, GtfsArchiveService],
})
export class GtfsArchiveModule {}
