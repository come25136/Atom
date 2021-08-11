import * as dayjs from 'dayjs'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { dayjsToDB } from 'src/util'

import { Remote } from '../remote/remote.entity'

export enum FeedType {
  TRIP_UPDATE = 1,
  VEHICLE_POSITION = 2,
  ALERT = 3,
}

@Entity()
@Unique(['remote', 'feedType'])
export class GtfsRealtime  {
  @ManyToOne(
    () => Remote,
    ({ gtfsRealtimes }) => gtfsRealtimes,
    { onDelete: 'CASCADE' },
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @CreateDateColumn({
    nullable: false,
    transformer: dayjsToDB,
  })
  readonly createdAt: dayjs.Dayjs

  @UpdateDateColumn({
    nullable: false,
    transformer: dayjsToDB,
        onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: dayjs.Dayjs

  @Column({
    type: 'enum',
    enum: FeedType,
  })
  feedType: FeedType

  @Column('text')
  url: string

  @Column('char', { length: 64 })
  latestFetchedHash: string

  @Column('datetime', {
    nullable: false,
    transformer: dayjsToDB,
  })
  latestFetchedDate: dayjs.Dayjs
}
