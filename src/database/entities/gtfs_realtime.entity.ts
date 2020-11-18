import * as moment from 'moment'
import { momentToDB } from 'src/util'
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

import { Remote } from './remote.entity'

export enum FeedType {
  TRIP_UPDATE = 1,
  VEHICLE_POSITION = 2,
  ALERT = 3,
}

@Entity()
@Unique(['remote', 'feedType'])
export class GtfsRealtime extends BaseEntity {
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
    transformer: momentToDB,
  })
  readonly createdAt: moment.Moment

  @UpdateDateColumn({
    nullable: false,
    transformer: momentToDB,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: moment.Moment

  @Column({
    type: 'enum',
    enum: FeedType,
  })
  feedType: FeedType

  @Column('text')
  url: string

  @Column('char', { length: 64 })
  hash: string

  @Column('datetime', {
    nullable: false,
    transformer: momentToDB,
  })
  lastAcquisitionDate: moment.Moment
}
