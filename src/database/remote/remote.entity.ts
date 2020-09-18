import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, OneToMany } from "typeorm"
import moment from 'moment'

@Entity()
export class Remote {
  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar', { unique: true })
  id: string

  @UpdateDateColumn({
    nullable: true,
    transformer: {
      from: v => (v === null ? null : moment.utc(v, 'YYYY-MM-DD HH:mm:ss')),
      to: (v: moment.Moment) => (moment.isMoment(v) ? new Date(v.clone().utc().format('YYYY-MM-DD HH:mm:ss')) : v)
    }
  })
  readonly updatedAt: moment.Moment

  @Column('char', { length: 64 })
  hash: string
  /*
  @OneToMany(
    () => Agency,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  agencies: Agency[]

  @OneToMany(
    () => Stop,
    ({ remote }) => remote
  )
  stops: Stop[]

  @OneToMany(
    () => Route,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  routes: Route[]

  @OneToMany(
    () => Trip,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  trips: Trip[]

  @OneToMany(
    () => StopTime,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  stopTimes: StopTime[]

  @OneToMany(
    () => Calendar,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  calendar: Calendar[]

  @OneToMany(
    () => CalendarDate,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  calendarDates: CalendarDate[]

  @OneToMany(
    () => FareAttribute,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  fareAttributes: FareAttribute[]

  @OneToMany(
    () => FareRule,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  fareRules: FareRule[]

  @OneToMany(
    () => Shape,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  shapes: Shape[]

  @OneToMany(
    () => Frequency,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  frequencies: Frequency[]

  @OneToMany(
    () => Transfer,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  transfers: Transfer[]

  @OneToMany(
    () => Pathway,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  pathways: Pathway[]

  @OneToMany(
    () => Level,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  levels: Level[]

  @OneToMany(
    () => FeedInfo,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  feedInfos: FeedInfo[]

  @OneToMany(
    () => Translation,
    ({ remote }) => remote,
    {
      cascade: true
    }
  )
  translations: Translation[]
  */
}
