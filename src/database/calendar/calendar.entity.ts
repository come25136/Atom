import * as GTFS from '@come25136/gtfs'
import * as moment from 'moment-timezone'
import { momentToDB } from 'src/util'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { Remote } from '../remote/remote.entity'
import { Trip } from '../trip/trip.entity'

@Entity()
@Unique(['remote', 'serviceId'])
export class Calendar extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ calendar }) => calendar,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @UpdateDateColumn({
    nullable: false,
    transformer: momentToDB,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: moment.Moment

  @Column('varchar')
  serviceId: GTFS.Trip['serviceId']

  @Column('int')
  monday: GTFS.Calendar['days']['mon']

  @Column('int')
  tuesday: GTFS.Calendar['days']['tues']

  @Column('int')
  wednesday: GTFS.Calendar['days']['wednes']

  @Column('int')
  thursday: GTFS.Calendar['days']['thurs']

  @Column('int')
  friday: GTFS.Calendar['days']['fri']

  @Column('int')
  saturday: GTFS.Calendar['days']['satur']

  @Column('int')
  sunday: GTFS.Calendar['days']['sun']

  @Column('date', {
    transformer: momentToDB,
  })
  startDate: GTFS.Calendar['date']['start']

  @Column('date', {
    transformer: momentToDB,
  })
  endDate: GTFS.Calendar['date']['end']

  @OneToMany(
    () => Trip,
    ({ calendar }) => calendar,
  )
  trips: Trip[]

  /*
  static async findServiceIds(date: moment.Moment): Promise<string[]> {
    const calendarDates = await CalendarDates.find({ date: Between() })

    return _.concat<{ serviceId: string }>(
      this.calendar.filter(calendar => {
        if (
          date.isBetween(
            calendar.date.start,
            calendar.date.end,
            'day',
            '[]'
          ) === false
        )
          return false

        const base: boolean =
          calendar.days[
          dayNames[date.day()] as
          | 'sun'
          | 'mon'
          | 'tues'
          | 'wednes'
          | 'thurs'
          | 'fri'
          | 'satur'
          ]

        const serviceIdMatchCalendarDates = calendarDates.filter(
          calendarDate => calendarDate.serviceId === calendar.serviceId
        )

        if (serviceIdMatchCalendarDates.length) {
          const add = serviceIdMatchCalendarDates.some(
            service => service.exceptionType === 1
          )

          const remove = serviceIdMatchCalendarDates.some(
            service => service.exceptionType === 2
          )

          if (remove) return false
          if (add) return true
        }

        return base
      }),
      _.filter(calendarDates, {
        exceptionType: 1
      })
    ).map(({ serviceId }) => serviceId)
  }
  */
}
