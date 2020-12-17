import { HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { GtfsRealtimeRepository } from 'src/database/entities/gtfs_realtime.repository'
import { GtfsRealtimeService } from './gtfs-realtime.service'

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([GtfsRealtimeRepository])],
  providers: [GtfsRealtimeService],
  exports: [TypeOrmModule],
})
export class GtfsRealtimeModule {}
