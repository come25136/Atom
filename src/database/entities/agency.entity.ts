import * as GTFS from '@come25136/gtfs'
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { FareAttribute } from './fare_attribute.entity'
import { Remote } from './remote.entity'
import { Route } from './route.entity'

@Entity()
@Index(['remote', 'id'])
export class Agency {
  @ManyToOne(
    () => Remote,
    ({ agencies }) => agencies,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar', { nullable: true, default: null })
  id: GTFS.Agency['id']

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
}
