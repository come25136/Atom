import {
  EntityRepository,
  FindOneOptions,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm'
import { Transactional } from 'typeorm-transactional-cls-hooked'
import * as dayjs from 'dayjs'

import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { Calendar } from './calendar.entity'

@EntityRepository(Calendar)
export class CalendarRepository extends BaseRepository<Calendar> {
  static readonly dayNames = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ] as const

  async findOneByRemoteUidAndId(): Promise<Calendar> {
    throw new Error(
      'The function cannot be used because there is no ID in Calendar.',
    )
  }

  async findByRemoteUidAndDate(
    remoteUid: Remote['uid'],
    date: dayjs.Dayjs,
    other?: FindOneOptions<Calendar>,
  ): Promise<Calendar[]> {
    const dateStr = date.format('YYYY-MM-DD')

    return this.find({
      ...other,
      where: {
        startDate: LessThanOrEqual(dateStr),
        endDate: MoreThanOrEqual(dateStr),
        [Calendar.dayNames[date.day()]]: 1,
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
