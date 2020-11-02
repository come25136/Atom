import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { TripRepository } from 'src/database/entities/trip.repository'
import { TripService } from './trip.service'

@Module({
  imports: [TypeOrmModule.forFeature([TripRepository])],
  providers: [TripService],
  exports: [TypeOrmModule],
})
export class TripModule {}
