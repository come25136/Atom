import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { StopTimeRepository } from 'src/database/entities/stop_time.repository'
import { StopTimeService } from './stop-time.service'

@Module({
  imports: [TypeOrmModule.forFeature([StopTimeRepository])],
  providers: [StopTimeService],
  exports: [TypeOrmModule],
})
export class StopTimeModule {}
