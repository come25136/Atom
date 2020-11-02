import * as moment from 'moment'
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

import { Agency } from './agency.entity'
import { Calendar } from './calendar.entity'
import { CalendarDate } from './calendar_date.entity'
import { FareAttribute } from './fare_attribute.entity'
import { FareRule } from './fare_rule.entity'
import { FeedInfo } from './feed_info.entity'
import { Frequency } from './frequency.entity'
import { GtfsRealtime } from './gtfs_realtime.entity'
import { GtfsStatic } from './gtfs_static.entity'
import { Level } from './level.entity'
import { Pathway } from './pathway.entity'
import { Route } from './route.entity'
import { Shape } from './shape.entity'
import { Stop } from './stop.entity'
import { StopTime } from './stop_time.entity'
import { Transfer } from './transfer.entity'
import { Translation } from './translation.entity'
import { Trip } from './trip.entity'

@Entity()
export class Remote {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  readonly uid: number

  @Column('varchar', { unique: true })
  id: string

  @CreateDateColumn({
    nullable: false,
    transformer: {
      from: v => (v === null ? null : moment.utc(v, 'YYYY-MM-DD HH:mm:ss')),
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
  readonly createdAt: moment.Moment

  @UpdateDateColumn({
    nullable: false,
    transformer: {
      from: v => (v === null ? null : moment.utc(v, 'YYYY-MM-DD HH:mm:ss')),
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
  readonly updatedAt: moment.Moment

  @Column('text')
  displayName: string

  @Column('text')
  portalUrl: string

  @Column('text')
  license: string

  @Column('text', { nullable: true })
  licenseUrl: string | null = null

  @OneToOne(
    () => GtfsStatic,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  gtfsStatic: GtfsStatic

  @OneToMany(
    () => GtfsRealtime,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  gtfsRealtimes: GtfsRealtime[]

  @OneToMany(
    () => Agency,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  agencies: Agency[]

  @OneToMany(
    () => Stop,
    ({ remote }) => remote,
  )
  stops: Stop[]

  @OneToMany(
    () => Route,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  routes: Route[]

  @OneToMany(
    () => Trip,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  trips: Trip[]

  @OneToMany(
    () => StopTime,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  stopTimes: StopTime[]

  @OneToMany(
    () => Calendar,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  calendar: Calendar[]

  @OneToMany(
    () => CalendarDate,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  calendarDates: CalendarDate[]

  @OneToMany(
    () => FareAttribute,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  fareAttributes: FareAttribute[]

  @OneToMany(
    () => FareRule,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  fareRules: FareRule[]

  @OneToMany(
    () => Shape,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  shapes: Shape[]

  @OneToMany(
    () => Frequency,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  frequencies: Frequency[]

  @OneToMany(
    () => Transfer,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  transfers: Transfer[]

  @OneToMany(
    () => Pathway,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  pathways: Pathway[]

  @OneToMany(
    () => Level,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  levels: Level[]

  @OneToMany(
    () => FeedInfo,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  feedInfos: FeedInfo[]

  @OneToMany(
    () => Translation,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  translations: Translation[]
}
