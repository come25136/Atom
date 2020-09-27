import * as GTFS from '@come25136/gtfs'
import * as moment from 'moment-timezone'
import { BaseEntity, Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Remote } from './remote.entity'
import { Stop } from './stop.entity'
import { Trip } from './trip.entity'

@Entity()
@Index(['remote', 'tripId'])
@Index(['remote', 'stopId'])
export class StopTime extends BaseEntity {
  @ManyToOne(
    () => Remote,
    ({ stopTimes }) => stopTimes,
    { onDelete: 'CASCADE' }
  )
  remote: Remote

  @PrimaryGeneratedColumn()
  readonly uid: number

  @Column('varchar')
  tripId: GTFS.StopTime['tripId']

  @ManyToOne(
    () => Trip,
    ({ stopTimes }) => stopTimes
  )
  trip: Trip

  @Column('time', {
    nullable: true,
    transformer: {
      from: v => (v === null ? null : moment('1970-01-01').seconds(moment.duration(v).asSeconds())),
      to: (v: moment.Moment) => moment.isMoment(v) ? v.year() === 1970 ? `${v.date() - 1} ${v.format('HH:mm:ss')}` : v.format('HH:mm:ss') : v
    }
  })
  arrivalTime: GTFS.StopTime['time']['arrival'] = null

  @Column('time', {
    nullable: true,
    transformer: {
      from: v => (v === null ? null : moment('1970-01-01').seconds(moment.duration(v).asSeconds())),
      to: (v: moment.Moment) => moment.isMoment(v) ? v.year() === 1970 ? `${v.date() - 1} ${v.format('HH:mm:ss')}` : v.format('HH:mm:ss') : v
    }
  })
  departureTime: GTFS.StopTime['time']['departure'] = null

  @Column('varchar')
  stopId: string

  @ManyToOne(
    () => Stop,
    ({ times }) => times
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

  get public(): GTFS.StopTime {
    return {
      tripId: this.tripId,
      time: {
        arrival: this.arrivalTime,
        departure: this.departureTime
      },
      stopId: this.stopId,
      sequence: this.sequence,
      headsign: this.headsign,
      pickupType: this.pickupType,
      dropOffType: this.dropOffType,
      shapeDistTraveled: this.shapeDistTraveled,
      timepoint: this.timepoint
    }
  }
}
