import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarDateRepository } from 'src/database/entities/calendar_date.repository';
import { CalendarDateService } from './calendar-date.service';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarDateRepository])],
  providers: [CalendarDateService],
  exports: [TypeOrmModule]
})
export class CalendarDateModule { }
