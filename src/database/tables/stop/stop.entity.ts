import * as GTFS from '@come25136/gtfs'
import * as dayjs from 'dayjs'
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { dayjsToDB } from 'src/util'

import { FareRule } from '../fare-rule/fare_rule.entity'
import { Level } from '../level/level.entity'
import { Pathway } from '../pathway/pathway.entity'
import { Remote } from '../remote/remote.entity'
import { Shape } from '../shape/shape.entity'
import { StopCluster } from '../stop-cluster/stop-cluster.entity'
import { StopTime } from '../stop-time/stop_time.entity'
import { Transfer } from '../transfer/transfer.entity'

@Entity()
@Unique(['remote', 'id'])
export class Stop {
  @ManyToOne(
    () => Remote,
    ({ stops }) => stops,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  id: GTFS.Stop['id']

  @UpdateDateColumn({
    nullable: false,
    transformer: dayjsToDB,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: dayjs.Dayjs

  @Column('varchar', { nullable: true, default: null })
  code: GTFS.Stop['code'] = null

  @Column('varchar', { nullable: true, default: null })
  name: GTFS.Stop['name'] = null

  @Column('varchar', { nullable: true, default: null })
  description: GTFS.Stop['description'] = null

  @Column('geometry', {
    nullable: true,
    srid: 4326,
    transformer: {
      from: (v: string): GTFS.Location => {
        if (v === null) return null

        const [lon, lat] = v
          .split('(')[1]
          .split(')')[0]
          .split(' ')

        return { lat: Number(lat), lon: Number(lon) }
      },
      to: (v: GTFS.Location) =>
        v === null ? null : `POINT(${v.lon} ${v.lat})`,
    },
  })
  location: null | GTFS.Location = null

  @Column('varchar', { nullable: true, default: null })
  zoneId: GTFS.Stop['zone']['id'] = null

  @Column('varchar', { nullable: true, default: null })
  url: GTFS.Stop['url'] = null

  @Column('tinyint', { default: 0 })
  locationType: GTFS.Stop['location']['type'] = 0

  @Column('varchar', { nullable: true, default: null })
  parentStation: GTFS.Stop['parentStation'] = null

  @Column('varchar', { nullable: true, default: null })
  timezone: GTFS.Stop['timezone'] = null

  @Column('tinyint')
  wheelchairBoarding: GTFS.Stop['wheelchairBoarding'] = 0

  @Column('varchar', { nullable: true, default: null })
  levelId: GTFS.Stop['level']['id'] = null

  @Column('varchar', { nullable: true, default: null })
  platformCode: GTFS.Stop['platformCode'] = null

  @OneToMany(
    () => FareRule,
    ({ origin }) => origin,
    {
      cascade: true,
    },
  )
  origins: FareRule[]

  @OneToMany(
    () => FareRule,
    ({ destination }) => destination,
    { cascade: true },
  )
  destinations: FareRule[]

  @OneToMany(
    () => FareRule,
    ({ contain }) => contain,
    { cascade: true },
  )
  contains: FareRule[]

  @ManyToOne(
    () => Level,
    ({ stops }) => stops,
  )
  level: Level

  @OneToMany(
    () => Transfer,
    ({ fromStop }) => fromStop,
    { cascade: true },
  )
  fromTransfers: Transfer[]

  @OneToMany(
    () => Transfer,
    ({ toStop }) => toStop,
    { cascade: true },
  )
  toTransfers: Transfer[]

  @OneToMany(
    () => Pathway,
    ({ fromStop }) => fromStop,
    { cascade: true },
  )
  fromPathways: Pathway[]

  @OneToMany(
    () => Pathway,
    ({ toStop }) => toStop,
    { cascade: true },
  )
  toPathways: Pathway[]

  @OneToMany(
    () => StopTime,
    ({ stop }) => stop,
    { cascade: true },
  )
  times: StopTime[]

  @OneToMany(
    () => Shape,
    ({ stop }) => stop,
  )
  shapes: Shape[]

  @ManyToMany(
    () => StopCluster,
    ({ stops }) => stops,
  )
  cluster: StopCluster
}
