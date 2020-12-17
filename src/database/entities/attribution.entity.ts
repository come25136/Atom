import * as GTFS from '@come25136/gtfs'
import { momentToDB } from 'src/util'
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
import { Agency } from './agency.entity'

import { FareAttribute } from './fare_attribute.entity'
import { Remote } from './remote.entity'
import { Route } from './route.entity'
import { Trip } from './trip.entity'

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
    transformer: momentToDB,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: moment.Moment

  @Column('varchar', { nullable: true, default: null })
  agencyId: GTFS.Attribution['agency']['id']

  @ManyToMany(
    () => Agency,
    ({ attributions }) => attributions,
  )
  agency: Agency[]

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
