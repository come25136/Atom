import { HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { GtfsStaticRepository } from 'src/database/entities/gtfs_static.repository'
import { GtfsStaticService } from './gtfs-static.service'

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([GtfsStaticRepository])],
  providers: [GtfsStaticService],
  exports: [TypeOrmModule],
})
export class GtfsStaticModule {}
