import * as GTFS from '@come25136/gtfs'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Remote } from './remote.entity'
import { Stop } from './stop.entity'

@Entity()
export class Transfer extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ transfers }) => transfers,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  fromStopId: GTFS.Transfer['stop']['from']['id']

  @ManyToOne(() => Stop)
  fromStop: Stop

  @Column('varchar')
  toStopId: GTFS.Transfer['stop']['to']['id']

  @ManyToOne(() => Stop)
  toStop: Stop

  @Column('tinyint')
  type: GTFS.Transfer['type']

  @Column('int', { nullable: true, default: null })
  minTransferTime: number = null
}
