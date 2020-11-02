import * as GTFS from '@come25136/gtfs'
import * as _ from 'lodash'
import { Injectable } from '@nestjs/common'

import { Calendar } from 'src/database/entities/calendar.entity'
import { CalendarDate } from 'src/database/entities/calendar_date.entity'
import { CalendarDateRepository } from 'src/database/entities/calendar_date.repository'
import { CalendarRepository } from 'src/database/entities/calendar.repository'
import { Remote } from 'src/database/entities/remote.entity'
import { Transactional } from 'typeorm-transactional-cls-hooked'

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
  async save(entities: Calendar[], updateEntity = false) {
    return this.calendarRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({ overwrite: this.calendarRepository.getColumns })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }

  @Transactional()
  async findServiceIdsByRemoteUidAndDate(
    remoteUid: Remote['uid'],
    date: moment.Moment,
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