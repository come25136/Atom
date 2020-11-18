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

import { Remote } from './remote.entity'
import { Stop } from './stop.entity'

@Entity()
@Unique(['remote', 'fromStopId', 'toStopId'])
export class Transfer extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ transfers }) => transfers,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @UpdateDateColumn({
    nullable: false,
    transformer: momentToDB,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: moment.Moment

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
