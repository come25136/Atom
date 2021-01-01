import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CalendarDateModule } from '../calendar-date/calendar-date.module'
import { CalendarRepository } from 'src/database/calendar/calendar.repository'
import { CalendarService } from './calendar.service'

@Module({
  imports: [TypeOrmModule.forFeature([CalendarRepository]), CalendarDateModule],
  providers: [CalendarService],
  exports: [TypeOrmModule],
})
export class CalendarModule {}
