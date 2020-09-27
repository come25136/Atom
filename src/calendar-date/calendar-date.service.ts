import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common';
import { CalendarDate } from 'src/database/entities/calendar_date.entity';
import { CalendarDateRepository } from 'src/database/entities/calendar_date.repository';
import { Remote } from 'src/database/entities/remote.entity';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class CalendarDateService {
  constructor(
    private calendarDateRepository: CalendarDateRepository,
  ) { }

  @Transactional()
  async createOrUpdate(remoteUid: Remote['uid'], data: GTFS.CalendarDate): Promise<CalendarDate> {
    const calendarDateEntity =
      await this.calendarDateRepository.findOneByRemoteUidAndServiceIdAndDateAndExceptionType(remoteUid, data.serviceId, data.date, data.exceptionType)
      ?? this.calendarDateRepository.create({
        serviceId: data.serviceId,
        date: data.date,
        exceptionType: data.exceptionType,
      })

    return calendarDateEntity
  }

  @Transactional()
  async save(entities: CalendarDate[]) {
    return this.calendarDateRepository.save(entities)
  }
}
