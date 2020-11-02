import * as GTFS from '@come25136/gtfs'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'

import { FareAttribute } from './fare_attribute.entity'
import { Remote } from './remote.entity'
import { Route } from './route.entity'
import { Stop } from './stop.entity'

@Entity()
@Unique(['remote', 'id', 'routeId', 'originId', 'destinationId', 'containId'])
export class FareRule extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ fareRules }) => fareRules,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  id: GTFS.FareRule['fareId']

  @ManyToOne(
    () => FareAttribute,
    ({ fareRules }) => fareRules,
  )
  fareAttribute: FareAttribute

  @Column('varchar', { length: 126, nullable: true, default: null })
  routeId: string | null = null

  @ManyToOne(
    () => Route,
    ({ fareRules }) => fareRules,
  )
  route: Route

  @Column('varchar', { length: 126, nullable: true, default: null })
  originId: string | null = null

  @ManyToOne(
    () => Stop,
    ({ origins }) => origins,
  )
  origin: Stop

  @Column('varchar', { length: 126, nullable: true, default: null })
  destinationId: string | null = null

  @ManyToOne(
    () => Stop,
    ({ destinations }) => destinations,
  )
  destination: Stop

  @Column('varchar', { length: 126, nullable: true, default: null })
  containId: string | null = null

  @ManyToOne(
    () => Stop,
    ({ contains }) => contains,
  )
  contain: Stop
}
