import * as GTFS from '@come25136/gtfs'
import { momentToDB } from 'src/util'
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { Attribution } from '../attribution/attribution.entity'
import { FareAttribute } from '../fare-attribute/fare_attribute.entity'
import { Remote } from '../remote/remote.entity'
import { Route } from '../route/route.entity'

@Entity()
@Unique(['remote', 'id'])
export class Agency {
  @ManyToOne(
    () => Remote,
    ({ agencies }) => agencies,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar', { nullable: true, default: null })
  id: GTFS.Agency['id']

  @UpdateDateColumn({
    nullable: false,
    transformer: momentToDB,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: moment.Moment

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
    ({ agency }) => agency,
  )
  routes: Route[]

  @OneToMany(
    () => FareAttribute,
    ({ agency }) => agency,
  )
  fareAttributes: FareAttribute[]

  @OneToMany(
    () => Attribution,
    ({ agency }) => agency,
  )
  attributions: Attribution[]
}
