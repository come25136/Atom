import { AgencyRepository } from 'src/database/tables/agency/agency.repository'
import { ServiceService } from './service.service'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CalendarRepository } from 'src/database/tables/calendar/calendar.repository'
import { CalendarDateRepository } from 'src/database/tables/calendar-date/calendar_date.repository'

@Module({
  imports: [TypeOrmModule.forFeature([CalendarRepository, CalendarDateRepository])],
  providers: [ServiceService],
  exports: [TypeOrmModule, ServiceService],
})
export class ServiceModule { }
