import * as GTFS from '@come25136/gtfs'
import * as dayjs from 'dayjs'
import { dayjsToDB } from 'src/util'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { FareAttribute } from '../fare-attribute/fare_attribute.entity'
import { Remote } from '../remote/remote.entity'
import { Route } from '../route/route.entity'
import { Stop } from '../stop/stop.entity'

@Entity()
@Unique(['remote', 'id', 'routeId', 'originId', 'destinationId', 'containId'])
export class FareRule  {
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

  @UpdateDateColumn({
    nullable: false,
    transformer: dayjsToDB,
        onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: dayjs.Dayjs

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
