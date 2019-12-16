import * as GTFS from '@come25136/gtfs'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { FareAttribute } from './fare_attribute'
import { Remote } from './remote'
import { Route } from './route'
import { Stop } from './stop'

@Entity()
export class FareRule extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ fareRules }) => fareRules,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  fareId: GTFS.FareRule['fareId']

  @ManyToOne(
    () => FareAttribute,
    ({ fareRules }) => fareRules
  )
  fareAttribute: FareAttribute

  @ManyToOne(
    () => Route,
    ({ fareRules }) => fareRules
  )
  route: Route

  @ManyToOne(
    () => Stop,
    ({ origins }) => origins
  )
  origin: Stop

  @ManyToOne(
    () => Stop,
    ({ destinations }) => destinations
  )
  destination: Stop

  @ManyToOne(
    () => Stop,
    ({ contains }) => contains
  )
  contain: Stop
}
