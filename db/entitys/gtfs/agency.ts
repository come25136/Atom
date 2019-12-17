import * as GTFS from '@come25136/gtfs'
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { FareAttribute } from './fare_attribute'
import { Remote } from './remote'
import { Route } from './route'

@Entity()
export class Agency extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ agencies }) => agencies,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  id: GTFS.MultiAgency['id']

  @Column('varchar')
  name: GTFS.Agency['name']

  @Column('text')
  url: GTFS.Agency['url']

  @Column('varchar')
  timezone: GTFS.Agency['timezone']

  @Column('varchar', { nullable: true, default: null })
  lang: GTFS.Agency['lang'] = null

  @Column('varchar', { nullable: true, default: null })
  phone: GTFS.Agency['phone'] = null

  @Column('text', { nullable: true, default: null })
  fareUrl: GTFS.Agency['fareUrl'] = null

  @Column('varchar', { nullable: true, default: null })
  email: GTFS.Agency['email'] = null

  @OneToMany(
    () => Route,
    ({ agency }) => agency
  )
  routes: Route[]

  @OneToMany(
    () => FareAttribute,
    ({ agency }) => agency
  )
  fareAttributes: FareAttribute[]

  get public(): GTFS.Agency {
    return {
      id: this.id,
      name: this.name,
      url: this.url,
      timezone: this.timezone,
      lang: this.lang,
      phone: this.phone,
      fareUrl: this.fareUrl,
      email: this.email
    }
  }
}
