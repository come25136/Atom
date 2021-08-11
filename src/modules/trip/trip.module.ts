import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AgencyRepository } from 'src/database/tables/agency/agency.repository'
import { CalendarDateRepository } from 'src/database/tables/calendar-date/calendar_date.repository'
import { CalendarRepository } from 'src/database/tables/calendar/calendar.repository'
import { RouteRepository } from 'src/database/tables/route/route.repository'
import { StopTimeRepository } from 'src/database/tables/stop-time/stop_time.repository'

import { TripRepository } from 'src/database/tables/trip/trip.repository'
import { ServiceModule } from '../service/service.module'
import { TripService } from './trip.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TripRepository,
      AgencyRepository,
      CalendarRepository,
      CalendarDateRepository,
      RouteRepository,
      StopTimeRepository,
    ]),
    ServiceModule,
  ],
  providers: [TripService],
  exports: [TypeOrmModule, TripService],
})
export class TripModule { }
