import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { RemoteModule } from '../remote/remote.module'
import { StopController } from './stop.controller'
import { StopRepository } from 'src/database/tables/stop/stop.repository'
import { StopService } from './stop.service'
import { AgencyModule } from '../agency/agency.module'
import { ServiceModule } from '../service/service.module'
import { TripRepository } from 'src/database/tables/trip/trip.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([StopRepository, TripRepository]),
    forwardRef(() => RemoteModule),
    forwardRef(() => AgencyModule),
    ServiceModule,
  ],
  providers: [StopService],
  controllers: [StopController],
  exports: [TypeOrmModule, ServiceModule, StopService],
})
export class StopModule { }
