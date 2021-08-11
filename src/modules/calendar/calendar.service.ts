import * as GTFS from '@come25136/gtfs'
import * as _ from 'lodash'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { Calendar } from 'src/database/tables/calendar/calendar.entity'
import { CalendarDate } from 'src/database/tables/calendar-date/calendar_date.entity'
import { CalendarDateRepository } from 'src/database/tables/calendar-date/calendar_date.repository'
import { CalendarRepository } from 'src/database/tables/calendar/calendar.repository'
import { Remote } from 'src/database/tables/remote/remote.entity'
import * as dayjs from 'dayjs'

@Injectable()
export class CalendarService {
  constructor(
    private calendarRepository: CalendarRepository,
    private calendarDateRepository: CalendarDateRepository,
  ) {}

  create(remoteUid: Remote['uid'], data: GTFS.Calendar): Calendar {
    const calendarEntity = this.calendarRepository.create({
      serviceId: data.serviceId,
    })
    calendarEntity.monday = data.days.mon
    calendarEntity.tuesday = data.days.tues
    calendarEntity.wednesday = data.days.wednes
    calendarEntity.thursday = data.days.thurs
    calendarEntity.friday = data.days.fri
    calendarEntity.saturday = data.days.satur
    calendarEntity.sunday = data.days.sun
    calendarEntity.startDate = data.date.start
    calendarEntity.endDate = data.date.end

    return calendarEntity
  }

  @Transactional()
  async getUidOnly(remoteUid: Remote['uid'], serviceId: Calendar['serviceId']) {
    const calendar = await this.calendarRepository.findOneByRemoteUidAndServiceId(
      remoteUid,
      serviceId,
      {
        select: ['uid'],
      },
    )

    return calendar
  }

  @Transactional()
  async bulkUpsert(entities: Calendar[], updateEntity = false) {
    return this.calendarRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.calendarRepository.getUniqueColumns,
        overwrite: [...this.calendarRepository.getUniqueColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }

  @Transactional()
  async findServiceIdsByRemoteUidAndDate(
    remoteUid: Remote['uid'],
    date: dayjs.Dayjs,
  ): Promise<(Calendar['serviceId'] | CalendarDate['serviceId'])[]> {
    const [calendar, calendarDates] = await Promise.all([
      this.calendarRepository.findByRemoteUidAndDate(remoteUid, date),
      this.calendarDateRepository.findByRemoteUidAndDate(remoteUid, date),
    ])

    const serviceIds = calendar.map(({ serviceId }) => serviceId)

    calendarDates.forEach(calendarDate => {
      switch (calendarDate.exceptionType) {
        case 1:
          serviceIds.push(calendarDate.serviceId)
          break

        case 2:
          _.pull(serviceIds, calendarDate.serviceId)
          break
      }
    })

    return serviceIds
  }
}
