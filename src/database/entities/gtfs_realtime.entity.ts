import * as moment from 'moment'
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

// export interface FeedType {
//   TRIP_UPDATE: 'TripUpdate',
//   VEHICLE_POSITION: "VehiclePosition",
//   ALERT: "Alert"
// }

// export const FeedType: FeedType = {
//   TRIP_UPDATE: 'TripUpdate',
//   VEHICLE_POSITION: "VehiclePosition",
//   ALERT: "Alert"
// }

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
    transformer: {
      from: v => (v === null ? null : moment.utc(v, 'YYYY-MM-DD HH:mm:ss')),
      to: (v: moment.Moment) =>
        moment.isMoment(v)
          ? new Date(
              v
                .clone()
                .utc()
                .format('YYYY-MM-DD HH:mm:ss'),
            )
          : v,
    },
  })
  readonly createdAt: moment.Moment

  @UpdateDateColumn({
    nullable: false,
    transformer: {
      from: v => (v === null ? null : moment.utc(v, 'YYYY-MM-DD HH:mm:ss')),
      to: (v: moment.Moment) =>
        moment.isMoment(v)
          ? new Date(
              v
                .clone()
                .utc()
                .format('YYYY-MM-DD HH:mm:ss'),
            )
          : v,
    },
  })
  readonly updatedAt: moment.Moment

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
    transformer: {
      from: v => (v === null ? null : moment.utc(v, 'YYYY-MM-DD HH:mm:ss')),
      to: (v: moment.Moment) =>
        moment.isMoment(v)
          ? new Date(
              v
                .clone()
                .utc()
                .format('YYYY-MM-DD HH:mm:ss'),
            )
          : v,
    },
  })
  lastAcquisitionDate: moment.Moment
}
