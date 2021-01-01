import { EntityRepository, FindOneOptions, LessThanOrEqual } from 'typeorm'

import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { Calendar } from './calendar.entity'

const dayNames = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

@EntityRepository(Calendar)
export class CalendarRepository extends BaseRepository<Calendar> {
  async findOneByRemoteUidAndId(): Promise<Calendar> {
    throw new Error(
      'The function cannot be used because there is no ID in Calendar.',
    )
  }

  async findByRemoteUidAndDate(
    remoteUid: Remote['uid'],
    date: moment.Moment,
    other?: FindOneOptions<Calendar>,
  ): Promise<Calendar[]> {
    const dateStr = date.format('YYYY-MM-DD')

    return this.find({
      ...other,
      where: {
        startDate: LessThanOrEqual(dateStr),
        endDate: LessThanOrEqual(dateStr),
        [dayNames[date.day()]]: 1,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  async findOneByRemoteUidAndServiceId(
    remoteUid: Remote['uid'],
    serviceId: Calendar['serviceId'],
    other?: FindOneOptions<Calendar>,
  ): Promise<Calendar> {
    return this.findOne({
      ...other,
      where: {
        serviceId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }
}
