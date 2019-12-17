import * as GTFS from '@come25136/gtfs'
import * as moment from 'moment-timezone'
import { BaseEntity, Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Remote } from './remote'
import { Trip } from './trip'

@Entity()
export class CalendarDate extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ calendarDates }) => calendarDates,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  serviceId: GTFS.Trip['serviceId']

  @Column('date', {
    transformer: {
      from: v => (v === undefined ? undefined : moment.utc(v, 'YYYY-MM-DD')),
      to: (v: moment.Moment) => (moment.isMoment(v) ? new Date(v.clone().utc().format('YYYY-MM-DD HH:mm:ss')) : v)
    }
  })
  date: GTFS.CalendarDate['date']

  @Column('tinyint')
  exceptionType: GTFS.CalendarDate['exceptionType']

  @ManyToMany(
    () => Trip,
    ({ calendarDates: calendarDate }) => calendarDate,
    {
      cascade: ['insert']
    }
  )
  trips: Trip[]
}
