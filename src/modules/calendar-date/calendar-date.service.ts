import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { CalendarDate } from 'src/database/tables/calendar-date/calendar_date.entity'
import { CalendarDateRepository } from 'src/database/tables/calendar-date/calendar_date.repository'
import { Remote } from 'src/database/tables/remote/remote.entity'

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
  async getUidsOnly(
    remoteUid: Remote['uid'],
    serviceId: CalendarDate['serviceId'],
  ) {
    const calendarDates = await this.calendarDateRepository.findByRemoteUidAndServiceId(
      remoteUid,
      serviceId,
      {
        select: ['uid'],
      },
    )

    return calendarDates
  }

  @Transactional()
  async bulkUpsert(entities: CalendarDate[], updateEntity = false) {
    return this.calendarDateRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.calendarDateRepository.getUniqueColumns,
        overwrite: [
          ...this.calendarDateRepository.getUniqueColumns,
          'updatedAt',
        ],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }
}
