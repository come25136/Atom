import * as GTFS from '@come25136/gtfs'
import * as dayjs from 'dayjs'
import * as dayjsDuration from 'dayjs/plugin/duration'
import { dayjsToDB } from 'src/util'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { Remote } from '../remote/remote.entity'
import { Stop } from '../stop/stop.entity'
import { Trip } from '../trip/trip.entity'

dayjs.extend(dayjsDuration)

@Entity()
@Unique(['remote', 'tripId', 'stopId', 'sequence'])
@Index(['remote', 'tripId'])
@Index(['remote', 'stopId'])
export class StopTime {
  @ManyToOne(
    () => Remote,
    ({ stopTimes }) => stopTimes,
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

  @Column('varchar')
  tripId: GTFS.StopTime['tripId']

  @ManyToOne(
    () => Trip,
    ({ stopTimes }) => stopTimes,
  )
  trip: Trip

  @Column('time', {
    nullable: true,
    transformer: {
      from: v =>
        v === null
          ? null
          : dayjs(`1970-01-01 ${v}`, 'YYYY-MM-DD HH:mm:ss'),
      to: (v: dayjs.Dayjs) =>
        dayjs.isDayjs(v)
          ? v.year() === 1970
            ? `${v.date() - 1} ${v.format('HH:mm:ss')}`
            : v.format('HH:mm:ss')
          : v,
    },
  })
  arrivalTime: dayjs.Dayjs | null = null

  @Column('time', {
    nullable: true,
    transformer: {
      from: v =>
        v === null
          ? null
          : dayjs(`1970-01-01 ${v}`, 'YYYY-MM-DD HH:mm:ss'),
      to: (v: dayjs.Dayjs) =>
        dayjs.isDayjs(v)
          ? v.year() === 1970
            ? `${v.date() - 1} ${v.format('HH:mm:ss')}`
            : v.format('HH:mm:ss')
          : v,
    },
  })
  departureTime: dayjs.Dayjs | null = null

  @Column('varchar')
  stopId: string

  @ManyToOne(
    () => Stop,
    ({ times }) => times,
  )
  stop: Stop

  @Column('int')
  sequence: GTFS.StopTime['sequence']

  @Column('varchar', { nullable: true, default: null })
  headsign: GTFS.StopTime['headsign'] = null

  @Column('tinyint', { nullable: true, default: null })
  pickupType: GTFS.StopTime['pickupType'] = null

  @Column('tinyint', { nullable: true, default: null })
  dropOffType: GTFS.StopTime['dropOffType'] = null

  @Column('int', { nullable: true, default: null })
  shapeDistTraveled: GTFS.StopTime['shapeDistTraveled'] = null

  @Column('tinyint', { nullable: true, default: null })
  timepoint: GTFS.StopTime['timepoint'] = null

  get public() {
    return {
      tripId: this.tripId,
      time: {
        arrival: this.arrivalTime,
        departure: this.departureTime,
      },
      stopId: this.stopId,
      sequence: this.sequence,
      headsign: this.headsign,
      pickupType: this.pickupType,
      dropOffType: this.dropOffType,
      shapeDistTraveled: this.shapeDistTraveled,
      timepoint: this.timepoint,
    }
  }
}
