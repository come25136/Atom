import * as GTFS from '@come25136/gtfs'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Remote } from './remote'
import { Stop } from './stop'

@Entity()
export class Pathway extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ pathways }) => pathways,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  id: GTFS.Pathway['id']

  @Column('varchar')
  fromStopId: GTFS.Pathway['from']['stop']['id']

  @Column('varchar')
  toStopId: GTFS.Pathway['to']['stop']['id']

  @Column('tinyint')
  pathwayMode: GTFS.Pathway['pathwayMode']

  @Column('tinyint')
  isBidirectional: GTFS.Pathway['isBidirectional']

  @Column('int', { nullable: true })
  length: GTFS.Pathway['length'] = null

  @Column('int', { nullable: true })
  traversalTime: GTFS.Pathway['traversalTime'] = null

  @Column('int', { nullable: true })
  stairCount: GTFS.Pathway['stair']['count'] = null

  @Column('int', { nullable: true })
  maxSlope: GTFS.Pathway['slope']['max'] = null

  @Column('int', { nullable: true })
  minWidth: GTFS.Pathway['width']['min'] = null

  @Column('text', { nullable: true })
  signpostedAs: GTFS.Pathway['signpostedAs'] = null

  @Column('text', { nullable: true })
  reversedSignpostedAs: GTFS.Pathway['reversedSignpostedAs'] = null

  @ManyToOne(
    () => Stop,
    ({ froms }) => froms
  )
  from: Stop

  @ManyToOne(
    () => Stop,
    ({ to }) => to
  )
  to: Stop
}
