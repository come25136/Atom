import * as GTFS from '@come25136/gtfs'
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { FareRule } from './fare_rule'
import { Level } from './level'
import { Pathway } from './pathway'
import { Remote } from './remote'
import { StopTime } from './stop_time'
import { Translation } from './translation'

@Entity()
export class Stop extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ stops }) => stops,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  id: GTFS.Stop['id']

  @Column('varchar', { nullable: true })
  code: GTFS.Stop['code'] = null

  @Column('varchar', { nullable: true })
  name: GTFS.Stop['name'] = null

  @Column('varchar', { nullable: true })
  description: GTFS.Stop['description'] = null

  @Column('geometry', {
    nullable: true,
    transformer: {
      from: (v: string): GTFS.Location => {
        if (v === null) return null

        const [lat, lon] = v
          .split('(')[1]
          .split(')')[0]
          .split(' ')

        return { lat: Number(lat), lon: Number(lon) }
      },
      to: (v: GTFS.Location) => (v === null ? null : `POINT(${v.lat} ${v.lon})`)
    }
  })
  location: null | GTFS.Location = null

  @Column('varchar', { nullable: true })
  zoneId: GTFS.Stop['zone']['id'] = null

  @Column('varchar', { nullable: true })
  url: GTFS.Stop['url'] = null

  @Column('tinyint', { default: 0 })
  locationType: GTFS.Stop['location']['type'] = 0

  @Column('varchar', { nullable: true })
  parentStation: GTFS.Stop['parentStation'] = null

  @Column('varchar', { nullable: true })
  timezone: GTFS.Stop['timezone'] = null

  @Column('tinyint')
  wheelchairBoarding: GTFS.Stop['wheelchairBoarding'] = 0

  @Column('varchar', { nullable: true })
  levelId: GTFS.Stop['level']['id'] = null

  @Column('varchar', { nullable: true })
  platformCode: GTFS.Stop['platformCode'] = null

  @OneToMany(
    () => FareRule,
    ({ origin }) => origin
  )
  origins: FareRule[]

  @OneToMany(
    () => FareRule,
    ({ destination }) => destination
  )
  destinations: FareRule[]

  @OneToMany(
    () => FareRule,
    ({ contain: contains }) => contains
  )
  contains: FareRule[]

  @ManyToOne(
    () => Level,
    ({ stops }) => stops,
    { cascade: true }
  )
  level: Level

  @OneToMany(
    () => Pathway,
    ({ from }) => from
  )
  froms: Pathway[]

  @OneToMany(
    () => Pathway,
    ({ to }) => to
  )
  to: Pathway[]

  @OneToMany(
    () => StopTime,
    ({ stop }) => stop,
    { cascade: true }
  )
  times: StopTime[]

  @OneToMany(
    () => Translation,
    ({ stop }) => stop
  )
  translations: Translation[]

  get public(): GTFS.Stop {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      location: {
        type: this.locationType,
        lat: this.location.lat,
        lon: this.location.lon
      },
      zone: {
        id: this.zoneId
      },
      url: this.url,
      parentStation: this.parentStation,
      timezone: this.timezone,
      wheelchairBoarding: this.wheelchairBoarding,
      level: {
        id: this.levelId
      },
      platformCode: this.platformCode
    }
  }
}
