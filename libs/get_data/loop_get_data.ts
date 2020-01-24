import * as config from 'config'
import * as env from 'env-var'
import * as moment from 'moment-timezone'
import * as superagent from 'superagent'

import { Config } from '../../app'
import { Vehicle } from '../classes/create_vehicle'
import { decode, FeedMessage, ScheduleRelationship, TripUpdate } from '../gtfs/realtime'
import logger from '../logger'

export type dataUpdatedCallback = (
  remote: {
    uid: number
    id: string
  },
  broadcastVehicles: Vehicle['public'][]
) => void

interface Prev {
  date: null | moment.Moment

  vehicles: Vehicle[]
}

export class LoopGetRealtimeData {
  private _loopTimer: NodeJS.Timer | null = null

  private _changeTimes: number[] = []

  private _prev: Prev = {
    date: null,

    vehicles: []
  }

  constructor(
    readonly remote: {
      uid: number
      id: string
    },
    readonly dataUpdatedCallback: dataUpdatedCallback
  ) {
    this.loopStart()
  }

  protected updateData(vehicles: Vehicle[], updatedDate: moment.Moment): Vehicle['public'][] {
    this._prev.date = updatedDate

    this._prev.vehicles = vehicles

    logger.debug(`The realtime data of remote ID '${this.remote.id}' has been updated!!`)

    this.dataUpdatedCallback(this.remote, this.broadcastVehicles)

    return this.broadcastVehicles
  }

  protected get prev(): Prev {
    return this._prev
  }

  protected get buses(): Vehicle[] {
    return this._prev.vehicles
  }

  public get broadcastVehicles(): Vehicle['public'][] {
    return this._prev.vehicles.map(vehicle => vehicle.public)
  }

  protected get changeTimes(): number[] {
    return this._changeTimes
  }

  protected addChangeTime(ms: number) {
    this._changeTimes.push(ms)
    if (10 < this._changeTimes.length) this._changeTimes.shift()
  }

  protected get averageChangeTime(): number | null {
    return this._prev.date && 0 < this._changeTimes.length
      ? this._prev.date
        .clone()
        .add(
          this._changeTimes.reduce((prev, current) => prev + current) / this._changeTimes.length,
          'ms'
        )
        .diff(moment())
      : 0
  }

  public nextLoop(time: number): void {
    this._loopTimer = setTimeout(async () => this.loop(), time)
  }

  async loop(): Promise<void> {
    if (moment().isBetween(moment('01:00', 'HH:mm'), moment('05:00', 'HH:mm'))) {
      this.nextLoop(moment('5:00', 'H:mm').diff(moment()))

      return
    }

    try {
      const remote = config.get<Config['remotes']>('remotes')[this.remote.id]

      if ('realtime' in remote === false) return

      const [vehiclePositions, tripUpdates]: [FeedMessage, FeedMessage] = await Promise.all([
        superagent
          .get(remote.realtime.vehicle_position.url)
          .responseType('blob')
          .then(async ({ body }) => decode(body)),
        superagent
          .get(remote.realtime.trip_update.url)
          .responseType('blob')
          .then(async ({ body }) => decode(body))
      ])

      const feedGeneratedTimestamp: moment.Moment = moment.unix(vehiclePositions.header.timestamp)

      if ('entity' in vehiclePositions === false || 'entity' in tripUpdates === false) {
        if (this.prev.vehicles.length !== 0) this.updateData([], feedGeneratedTimestamp)

        this.nextLoop(18000)

        return
      }

      if (this.prev.date === null || feedGeneratedTimestamp.isAfter(this.prev.date)) {
        const buses: Vehicle[] = []

        for (const { vehicle } of vehiclePositions.entity) {
          if (
            vehicle === undefined ||
            vehicle.position === undefined ||
            Number.isNaN(vehicle.position.latitude) ||
            Number.isNaN(vehicle.position.longitude) ||
            vehicle.trip === undefined
          )
            continue

          const rtTrip = tripUpdates.entity.find(
            entity =>
              entity.trip_update &&
              vehicle.trip &&
              entity.trip_update.trip.trip_id === vehicle.trip!.trip_id
          ) as
            | {
              trip_update: TripUpdate
            }
            | undefined

          if (rtTrip === undefined || rtTrip.trip_update.stop_time_update === undefined) continue

          const stopTimeUpdate = rtTrip.trip_update.stop_time_update.find(
            ({ stop_sequence }) =>
              stop_sequence !== undefined && stop_sequence === vehicle.current_stop_sequence
          )
          if (
            stopTimeUpdate === undefined ||
            stopTimeUpdate.schedule_relationship === ScheduleRelationship.NO_DATA ||
            (stopTimeUpdate.schedule_relationship === ScheduleRelationship.SKIPPED &&
              stopTimeUpdate.arrival === undefined &&
              stopTimeUpdate.departure === undefined)
          )
            continue

          const tripOrRoute =
            'trip_id' in vehicle.trip
              ? { tripId: vehicle.trip.trip_id }
              : {
                routeId: vehicle.trip.route_id,
                firstStop: {
                  date: moment(
                    vehicle.trip!.start_date! + vehicle.trip.start_time,
                    'YYYYMMDDHH:mm:ss'
                  )
                }
              }

          try {
            buses.push(
              (await Vehicle.create(
                this.remote.uid,
                tripOrRoute,
                {
                  bearing: vehicle.position.bearing,
                  delay: rtTrip.trip_update.delay,
                  location: {
                    lat: vehicle.position!.latitude,
                    lon: vehicle.position!.longitude
                  },
                  passedStop: stopTimeUpdate,
                  descriptors: {
                    id: vehicle.vehicle!.id,
                    label: vehicle.vehicle!.label,
                    licensePlate: vehicle.vehicle!.license_plate
                  }
                }
              )) as Vehicle
            )
          } catch (err) {
            if (err.message !== 'This car has already arrived at the final stop.')
              logger.error(err, { remote: this.remote })
          }
        }

        if (this.prev.date) this.addChangeTime(feedGeneratedTimestamp.diff(this.prev.date))

        this.updateData(buses, feedGeneratedTimestamp)
      }

      const awaitTime =
        this.averageChangeTime !== null &&
          7000 <= this.averageChangeTime &&
          this.averageChangeTime <= 20000
          ? this.averageChangeTime
          : 7000

      env.get('NODE_ENV', 'development').asString() !== 'production' &&
        logger.debug(
          `After ${awaitTime / 1000} seconds, get realtime data of remote ID '${this.remote.id}'. ${
          this.averageChangeTime
          }`
        )

      this.nextLoop(awaitTime)
    } catch (err) {
      if (err.message !== 'missing required \'header\'') logger.warn(err)

      this.nextLoop(15000)
    }
  }

  public loopStart(): void {
    this.loop()
  }

  public get loopStatus(): boolean {
    return this._loopTimer !== null
  }

  public loopStop(): void {
    if (this._loopTimer) {
      clearTimeout(this._loopTimer)
      this._loopTimer = null
    }
  }

  public dispose() {
    this.loopStop()
  }
}
