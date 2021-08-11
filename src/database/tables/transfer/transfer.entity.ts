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

import { Remote } from '../remote/remote.entity'
import { Stop } from '../stop/stop.entity'

@Entity()
@Unique(['remote', 'fromStopId', 'toStopId'])
export class Transfer  {
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
    transformer: dayjsToDB,
        onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: dayjs.Dayjs

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
