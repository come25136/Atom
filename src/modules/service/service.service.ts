import * as GTFS from '@come25136/gtfs'
import { Connection, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'
import _ from 'lodash'

import { Agency } from 'src/database/tables/agency/agency.entity'
import { AgencyRepository } from 'src/database/tables/agency/agency.repository'
import { Translation } from 'src/database/tables/translation/translation.entity'
import { Remote } from 'src/database/tables/remote/remote.entity'
import * as dayjs from 'dayjs'
import { CalendarRepository } from 'src/database/tables/calendar/calendar.repository'
import { CalendarDateRepository } from 'src/database/tables/calendar-date/calendar_date.repository'

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

@Injectable()
export class ServiceService {
  constructor(
    private calendarRepository: CalendarRepository,
    private calendarDateRepository: CalendarDateRepository,
  ) { }

  @Transactional()
  async findServiceIds(remoteUid: Remote['uid'], date: dayjs.Dayjs) {
    const [calendar, calendarDates] = await Promise.all([
      this.calendarRepository.find({
        remote: { uid: remoteUid },
        startDate: LessThanOrEqual(date.format()),
        endDate: MoreThanOrEqual(date.format()),
        [dayNames[date.day()]]: 1
      }),
      this.calendarDateRepository.find({ remote: { uid: remoteUid }, date: date })
    ])

    const serviceIds = calendar.map(({ serviceId }) => serviceId)

    calendarDates.forEach(calendarDate => {
      switch (calendarDate.exceptionType) {
        case 1:
          serviceIds.push(calendarDate.serviceId)
          break

        case 2:
          _.pull(serviceIds, calendarDate.serviceId)
      }
    })

    return serviceIds
  }
}
