import * as GTFS from '@come25136/gtfs'
import {
  BaseEntity,
  Column,
  Entity,
  EntityManager,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  getRepository,
} from 'typeorm'

import { FareRule } from './fare_rule.entity'
import { Level } from './level.entity'
import { Pathway } from './pathway.entity'
import { Remote } from './remote.entity'
import { StopTime } from './stop_time.entity'
import { Transfer } from './transfer.entity'
import { Translation } from './translation.entity'

@Entity()
@Unique(['remote', 'id'])
export class Stop extends BaseEntity {
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

  @Column('varchar', { nullable: true, default: null })
  code: GTFS.Stop['code'] = null

  @Column('varchar', { nullable: true, default: null })
  name: GTFS.Stop['name'] = null

  @Column('varchar', { nullable: true, default: null })
  description: GTFS.Stop['description'] = null

  @Column('point', {
    nullable: true,
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
  )
  origins: FareRule[]

  @OneToMany(
    () => FareRule,
    ({ destination }) => destination,
  )
  destinations: FareRule[]

  @OneToMany(
    () => FareRule,
    ({ contain: contains }) => contains,
  )
  contains: FareRule[]

  @ManyToOne(
    () => Level,
    ({ stops }) => stops,
    { cascade: true },
  )
  level: Level

  @OneToMany(
    () => Transfer,
    ({ fromStop }) => fromStop,
  )
  fromTransfers: Transfer[]

  @OneToMany(
    () => Transfer,
    ({ toStop }) => toStop,
  )
  toTransfers: Transfer[]

  @OneToMany(
    () => Pathway,
    ({ fromStop }) => fromStop,
  )
  fromPathways: Pathway[]

  @OneToMany(
    () => Pathway,
    ({ toStop }) => toStop,
  )
  toPathways: Pathway[]

  @OneToMany(
    () => StopTime,
    ({ stop }) => stop,
    { cascade: true },
  )
  times: StopTime[]

  async translate(language: string, trn?: EntityManager) {
    const translationRepo =
      trn?.getRepository(Translation) ?? getRepository(Translation)

    const name = await translationRepo.findOne({
      where: [
        {
          remote: this.remote,
          language,
          tableName: 'stops',
          fieldName: 'stop_name',
          recordId: this.id,
        },
        {
          remote: this.remote,
          language,
          tableName: 'stops',
          fieldName: 'stop_name',
          fieldValue: this.name,
        },
      ],
    })

    return {
      id: this.id,
      code: this.code,
      name: name?.translation ?? this.name,
      description: this.description,
      locationType: this.locationType,
      location: {
        lat: this.location.lat,
        lon: this.location.lon,
      },
      zoneId: this.zoneId,
      url: this.url,
      parentStation: this.parentStation,
      timezone: this.timezone,
      wheelchairBoarding: this.wheelchairBoarding,
      levelId: this.levelId,
      platformCode: this.platformCode,
    }
  }

  get public(): GTFS.Stop {
    return Stop.public(this)
  }

  static public(
    stop: ReturnType<Stop['translate']> extends Promise<infer T> ? T : never,
  ): GTFS.Stop {
    return {
      id: stop.id,
      code: stop.code,
      name: stop.name,
      description: stop.description,
      location: {
        type: stop.locationType,
        lat: stop.location.lat,
        lon: stop.location.lon,
      },
      zone: {
        id: stop.zoneId,
      },
      url: stop.url,
      parentStation: stop.parentStation,
      timezone: stop.timezone,
      wheelchairBoarding: stop.wheelchairBoarding,
      level: {
        id: stop.levelId,
      },
      platformCode: stop.platformCode,
    }
  }
}
