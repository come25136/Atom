import * as dayjs from 'dayjs'
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

import { dayjsToDB } from 'src/util'

import { Agency } from '../agency/agency.entity'
import { Calendar } from '../calendar/calendar.entity'
import { CalendarDate } from '../calendar-date/calendar_date.entity'
import { FareAttribute } from '../fare-attribute/fare_attribute.entity'
import { FareRule } from '../fare-rule/fare_rule.entity'
import { FeedInfo } from '../feed-info/feed_info.entity'
import { Frequency } from '../frequency/frequency.entity'
import { GtfsRealtime } from '../gtfs-realtime/gtfs_realtime.entity'
import { GtfsStatic } from '../gtfs-static/gtfs_static.entity'
import { Level } from '../level/level.entity'
import { Pathway } from '../pathway/pathway.entity'
import { Route } from '../route/route.entity'
import { Shape } from '../shape/shape.entity'
import { Stop } from '../stop/stop.entity'
import { StopCluster } from '../stop-cluster/stop-cluster.entity'
import { StopTime } from '../stop-time/stop_time.entity'
import { Transfer } from '../transfer/transfer.entity'
import { Translation } from '../translation/translation.entity'
import { Trip } from '../trip/trip.entity'

export enum CrawlStatus {
  ERROR = 'ERROR',
  INITING = 'INITING',
  PENDING = 'PENDING',
  IMPORTING = 'IMPORTING',
  IMPORTED = 'IMPORTED',
}

@Entity()
export class Remote {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  readonly uid: number

  @Column('varchar', { unique: true })
  id: string

  @CreateDateColumn({
    nullable: false,
    transformer: dayjsToDB,
  })
  readonly createdAt: dayjs.Dayjs

  @UpdateDateColumn({
    nullable: false,
    transformer: dayjsToDB,
        onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: dayjs.Dayjs

  @Column({
    type: 'enum',
    enum: CrawlStatus,
    default: CrawlStatus.INITING,
  })
  crawlStatus: CrawlStatus = CrawlStatus.INITING

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

  @OneToMany(
    () => StopCluster,
    ({ remote }) => remote,
    {
      cascade: true,
    },
  )
  stopCluster: StopCluster[]
}
