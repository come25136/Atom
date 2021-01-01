import * as GTFS from '@come25136/gtfs'
import { momentToDB } from 'src/util'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { Remote } from '../remote/remote.entity'
import { Stop } from '../stop/stop.entity'

@Entity()
@Unique(['remote', 'id'])
export class Pathway extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ pathways }) => pathways,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  id: GTFS.Pathway['id']

  @UpdateDateColumn({
    nullable: false,
    transformer: momentToDB,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: moment.Moment

  @Column('varchar')
  fromStopId: GTFS.Pathway['from']['stop']['id']

  @Column('varchar')
  toStopId: GTFS.Pathway['to']['stop']['id']

  @Column('tinyint')
  pathwayMode: GTFS.Pathway['pathwayMode']

  @Column('tinyint')
  isBidirectional: GTFS.Pathway['isBidirectional']

  @Column('int', { nullable: true, default: null })
  length: GTFS.Pathway['length'] = null

  @Column('int', { nullable: true, default: null })
  traversalTime: GTFS.Pathway['traversalTime'] = null

  @Column('int', { nullable: true, default: null })
  stairCount: GTFS.Pathway['stair']['count'] = null

  @Column('int', { nullable: true, default: null })
  maxSlope: GTFS.Pathway['slope']['max'] = null

  @Column('int', { nullable: true, default: null })
  minWidth: GTFS.Pathway['width']['min'] = null

  @Column('text', { nullable: true, default: null })
  signpostedAs: GTFS.Pathway['signpostedAs'] = null

  @Column('text', { nullable: true, default: null })
  reversedSignpostedAs: GTFS.Pathway['reversedSignpostedAs'] = null

  @ManyToOne(
    () => Stop,
    ({ fromPathways: froms }) => froms,
  )
  fromStop: Stop

  @ManyToOne(
    () => Stop,
    ({ toPathways: to }) => to,
  )
  toStop: Stop
}
