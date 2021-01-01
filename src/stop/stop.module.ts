import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { StopRepository } from 'src/database/stop/stop.repository'
import { StopService } from './stop.service'

@Module({
  imports: [TypeOrmModule.forFeature([StopRepository])],
  providers: [StopService],
  exports: [TypeOrmModule],
})
export class StopModule {}
