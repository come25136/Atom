import * as GTFS from '@come25136/gtfs'
import * as moment from 'moment-timezone'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Remote } from './remote'
import { Stop } from './stop'
import { Trip } from './trip'

@Entity()
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
      from: v => (v === null ? null : moment.utc(v, 'HH:mm:ss')),
      to: (v: moment.Moment) => (moment.isMoment(v) ? new Date(v.clone().utc().format('YYYY-MM-DD HH:mm:ss')) : v)
    }
  })
  arrivalTime: GTFS.StopTime['time']['arrival'] = null

  @Column('time', {
    nullable: true,
    transformer: {
      from: v => (v === null ? null : moment.utc(v, 'HH:mm:ss')),
      to: (v: moment.Moment) => (moment.isMoment(v) ? new Date(v.clone().utc().format('YYYY-MM-DD HH:mm:ss')) : v)
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
  sequence: GTFS.Shape['sequence']

  @Column('varchar', { nullable: true })
  headsign: GTFS.StopTime['headsign'] = null

  @Column('tinyint', { nullable: true })
  pickupType: GTFS.StopTime['pickupType'] = null

  @Column('tinyint', { nullable: true })
  dropOffType: GTFS.StopTime['dropOffType'] = null

  @Column('int', { nullable: true })
  shapeDistTraveled: GTFS.StopTime['shapeDistTraveled'] = null

  @Column('tinyint', { nullable: true })
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
