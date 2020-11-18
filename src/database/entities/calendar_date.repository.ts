import { EntityRepository, FindOneOptions } from 'typeorm'
import { BaseRepository } from './base.repository'
import { CalendarDate } from './calendar_date.entity'
import { Remote } from './remote.entity'

@EntityRepository(CalendarDate)
export class CalendarDateRepository extends BaseRepository<CalendarDate> {
  async findOneByRemoteUidAndId(): Promise<CalendarDate> {
    throw new Error(
      'The function cannot be used because there is no ID in CalendarDate.',
    )
  }

  async findOneByRemoteUidAndServiceIdAndDateAndExceptionType(
    remoteUid: Remote['uid'],
    serviceId: CalendarDate['serviceId'],
    date: CalendarDate['date'],
    exceptionType: CalendarDate['exceptionType'],
    other?: FindOneOptions<CalendarDate>,
  ): Promise<CalendarDate> {
    return this.findOne({
      ...other,
      where: {
        serviceId,
        date,
        exceptionType,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  async findByRemoteUidAndServiceId(
    remoteUid: Remote['uid'],
    serviceId: CalendarDate['serviceId'],
    other?: FindOneOptions<CalendarDate>,
  ): Promise<CalendarDate[]> {
    return this.find({
      ...other,
      where: {
        serviceId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  async findByRemoteUidAndDate(
    remoteUid: Remote['uid'],
    date: moment.Moment,
    other?: FindOneOptions<CalendarDate>,
  ) {
    const dateStr = date.format('YYYY-MM-DD')

    return this.find({
      ...other,
      where: {
        date: dateStr,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }
}
