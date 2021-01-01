import * as GTFS from '@come25136/gtfs'
import * as moment from 'moment-timezone'
import { momentToDB } from 'src/util'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
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

  @UpdateDateColumn({
    nullable: false,
    transformer: momentToDB,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: moment.Moment

  @Column('varchar')
  serviceId: GTFS.Trip['serviceId']

  @Column('date', {
    transformer: momentToDB,
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
