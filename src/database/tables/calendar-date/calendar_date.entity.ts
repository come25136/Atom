import * as GTFS from '@come25136/gtfs'
import * as dayjs from 'dayjs'
import { dayjsToDB } from 'src/util'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { Remote } from '../remote/remote.entity'
import { Trip } from '../trip/trip.entity'

@Entity()
@Unique(['remote', 'serviceId', 'date', 'exceptionType'])
export class CalendarDate  {
  @ManyToOne(
    () => Remote,
    ({ calendarDates }) => calendarDates,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @UpdateDateColumn({
    nullable: false,
    transformer: dayjsToDB,
        onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: dayjs.Dayjs

  @Column('varchar')
  serviceId: GTFS.Trip['serviceId']

  @Column('date', {
    transformer: dayjsToDB,
  })
  date: GTFS.CalendarDate['date']

  @Column('tinyint')
  exceptionType: GTFS.CalendarDate['exceptionType']

  @ManyToMany(
    () => Trip,
    ({ calendarDates: calendarDate }) => calendarDate,
    {
      cascade: ['insert'],
    },
  )
  trips: Trip[]
}
