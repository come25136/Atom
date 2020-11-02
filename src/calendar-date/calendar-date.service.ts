import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { CalendarDate } from 'src/database/entities/calendar_date.entity'
import { CalendarDateRepository } from 'src/database/entities/calendar_date.repository'
import { Remote } from 'src/database/entities/remote.entity'

@Injectable()
export class CalendarDateService {
  constructor(private calendarDateRepository: CalendarDateRepository) {}

  create(remoteUid: Remote['uid'], data: GTFS.CalendarDate): CalendarDate {
    const calendarDateEntity = this.calendarDateRepository.create({
      serviceId: data.serviceId,
      date: data.date,
      exceptionType: data.exceptionType,
    })

    return calendarDateEntity
  }

  @Transactional()
  async save(entities: CalendarDate[], updateEntity = false) {
    return this.calendarDateRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({ overwrite: this.calendarDateRepository.getColumns })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }
}
