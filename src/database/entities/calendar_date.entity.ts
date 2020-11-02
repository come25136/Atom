import * as GTFS from '@come25136/gtfs'
import * as moment from 'moment-timezone'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'

import { Remote } from './remote.entity'
import { Trip } from './trip.entity'

@Entity()
@Unique(['remote', 'serviceId', 'date', 'exceptionType'])
export class CalendarDate extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ calendarDates }) => calendarDates,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  serviceId: GTFS.Trip['serviceId']

  @Column('date', {
    transformer: {
      from: v => (v === undefined ? undefined : moment.utc(v, 'YYYY-MM-DD')),
      to: (v: moment.Moment) =>
        moment.isMoment(v)
          ? new Date(
              v
                .clone()
                .utc()
                .format('YYYY-MM-DD HH:mm:ss'),
            )
          : v,
    },
  })
  date: GTFS.CalendarDate['date']

  @Column('tinyint')
  exceptionType: GTFS.CalendarDate['exceptionType']

  @OneToMany(
    () => Trip,
    ({ calendarDates: calendarDate }) => calendarDate,
    {
      cascade: ['insert'],
    },
  )
  trips: Trip[]
}
