import * as GTFS from '@come25136/gtfs'
import * as dayjs from 'dayjs'
import { dayjsToDB } from 'src/util'
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

import { Agency } from '../agency/agency.entity'
import { Attribution } from '../attribution/attribution.entity'
import { FareRule } from '../fare-rule/fare_rule.entity'
import { Remote } from '../remote/remote.entity'
import { Trip } from '../trip/trip.entity'

@Entity()
@Unique(['remote', 'agencyId', 'id'])
export class Route  {
  @ManyToOne(
    () => Remote,
    ({ routes: route }) => route,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  id: GTFS.Route['id']

  @UpdateDateColumn({
    nullable: false,
    transformer: dayjsToDB,
        onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: dayjs.Dayjs

  @Column('varchar', { nullable: true, default: null })
  agencyId: string | null = null

  @ManyToOne(
    () => Agency,
    ({ routes: route }) => route,
    { onDelete: 'CASCADE' },
  )
  agency: Agency

  @Column('varchar', { nullable: true, default: null })
  shortName: GTFS.Route['name']['short'] = null

  @Column('varchar', { nullable: true, default: null })
  longName: GTFS.Route['name']['long'] = null

  @Column('varchar', { nullable: true, default: null })
  description: GTFS.Route['description'] = null

  @Column('tinyint')
  type: GTFS.Route['type']

  @Column('varchar', { nullable: true, default: null })
  url: GTFS.Route['url'] = null

  @Column('char', { length: 6, nullable: true, default: null })
  color: GTFS.Route['color'] = null

  @Column('char', { length: 6, nullable: true, default: null })
  textColor: GTFS.Route['textColor'] = null

  @Column('int', { nullable: true, default: null })
  sortOrder: GTFS.Route['sortOrder'] = null

  @OneToMany(
    () => Trip,
    ({ route }) => route,
  )
  trips: Trip[]

  @OneToMany(
    () => FareRule,
    ({ route }) => route,
  )
  fareRules: FareRule[]

  @ManyToMany(
    () => Attribution,
    ({ route }) => route,
  )
  attributions: Attribution[]

  get public() {
    return {
      type: this.type,
      id: this.id,
      name: {
        short: this.shortName,
        long: this.longName,
      },
      description: this.description,
      color: this.color,
      text: {
        color: this.textColor,
      },
    }
  }
}
