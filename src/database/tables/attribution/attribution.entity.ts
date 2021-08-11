import * as GTFS from '@come25136/gtfs'
import * as dayjs from 'dayjs'
import { dayjsToDB } from 'src/util'
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { Agency } from '../agency/agency.entity'
import { Remote } from '../remote/remote.entity'
import { Route } from '../route/route.entity'
import { Trip } from '../trip/trip.entity'

@Entity()
@Unique(['remote', 'id'])
export class Attribution {
  @ManyToOne(
    () => Remote,
    ({ agencies }) => agencies,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar', { nullable: true, default: null })
  id: GTFS.Attribution['id']

  @UpdateDateColumn({
    nullable: false,
    transformer: dayjsToDB,
        onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: dayjs.Dayjs

  @Column('varchar', { nullable: true, default: null })
  agencyId: GTFS.Attribution['agency']['id']

  @ManyToOne(
    () => Agency,
    ({ attributions }) => attributions,
  )
  agency: Agency

  @Column('varchar', { nullable: true, default: null })
  routeId: GTFS.Attribution['route']['id']

  @ManyToMany(
    () => Route,
    ({ attributions }) => attributions,
  )
  route: Route[]

  @Column('varchar', { nullable: true, default: null })
  tripId: GTFS.Attribution['trip']['id']

  @ManyToMany(
    () => Trip,
    ({ attributions }) => attributions,
  )
  trip: Trip[]

  @Column('text')
  organizationName: GTFS.Attribution['organization']['name']

  @Column('int')
  isProducer: GTFS.Attribution['isProducer']

  @Column('int')
  isOperator: GTFS.Attribution['isOperator']

  @Column('int')
  isAuthority: GTFS.Attribution['isAuthority']

  @Column('text', { nullable: true, default: null })
  url: GTFS.Attribution['url']

  @Column('text', { nullable: true, default: null })
  email: GTFS.Attribution['email']

  @Column('text', { nullable: true, default: null })
  phone: GTFS.Attribution['phone']
}
