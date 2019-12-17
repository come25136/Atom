import * as GTFS from '@come25136/gtfs'
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { Agency } from './agency'
import { FareRule } from './fare_rule'
import { Remote } from './remote'
import { Trip } from './trip'

@Entity()
export class Route extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ routes: route }) => route,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  id: GTFS.Route['id']

  @ManyToOne(
    () => Agency,
    ({ routes: route }) => route,
    { onDelete: 'CASCADE' }
  )
  agency: Agency

  @Column('varchar', { nullable: true })
  shortName: GTFS.Route['name']['short'] = null

  @Column('varchar', { nullable: true })
  longName: GTFS.Route['name']['long'] = null

  @Column('varchar', { nullable: true })
  description: GTFS.Route['description'] = null

  @Column('tinyint')
  type: GTFS.Route['type']

  @Column('varchar', { nullable: true })
  url: GTFS.Route['url'] = null

  @Column('char', { length: 6, nullable: true })
  color: GTFS.Route['color'] = null

  @Column('char', { length: 6, nullable: true })
  textColor: GTFS.Route['textColor'] = null

  @Column('int', { nullable: true })
  sortOrder: GTFS.Route['sortOrder'] = null

  @OneToMany(
    () => Trip,
    ({ route }) => route
  )
  trips: Trip[]

  @OneToMany(
    () => FareRule,
    ({ route }) => route
  )
  fareRules: FareRule[]

  get public() {
    return {
      type: this.type,
      id: this.id,
      name: {
        short: this.shortName,
        long: this.longName
      },
      description: this.description,
      color: this.color,
      text: {
        color: this.textColor
      }
    }
  }
}
