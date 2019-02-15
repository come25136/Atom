import * as moment from 'moment'
import * as superagent from 'superagent'

import { createVehicle, Vehicle } from '../classes/create_vehicle'
import { decode, FeedMessage, StopTimeUpdate, TripUpdate } from '../gtfs/realtime'
import { getTrips, GtfsTrip } from '../gtfs/static'
import { getRoutesStops, RouteStop } from '../route'

import { LoopGetData } from './loop_get_data'

export class LoopRyobiBus extends LoopGetData {
  public get name(): string {
    return 'ryobibus'
  }

  async loop(): Promise<void> {
    if (moment().isBetween(moment('0:40', 'H:mm'), moment('5:00', 'H:mm'))) {
      setTimeout(this.loop.bind(this), moment('5:00', 'H:mm').diff(moment()))

      return
    }

    try {
      const [vehiclePositions, tripUpdates]: [FeedMessage, FeedMessage] = await Promise.all([
        superagent
          .get('http://loc.bus-vision.jp/realtime/ryobi_vpos_update.bin')
          .responseType('blob')
          .then(async ({ body }) => decode(body)),
        superagent
          .get('http://loc.bus-vision.jp/realtime/ryobi_trip_update.bin')
          .responseType('blob')
          .then(async ({ body }) => decode(body))
      ])

      const feedGeneratedTimestamp: moment.Moment = moment.unix(vehiclePositions.header.timestamp)

      if (
        this._prev.data.vehicles.length !== 0 &&
        (vehiclePositions.entity === undefined || tripUpdates.entity === undefined)
      )
        this.updateData([], feedGeneratedTimestamp)
      if (vehiclePositions.entity === undefined || tripUpdates.entity === undefined) {
        setTimeout(this.loop.bind(this), 18000)

        return
      }

      const prevDiffTime: number | null =
        this._prev.date && this._changeTimes.length
          ? this._prev.date
              .clone()
              .add(
                this._changeTimes.reduce((prev, current) => prev + current) /
                  this._changeTimes.length,
                'ms'
              )
              .diff(moment())
          : null

      const awaitTime =
        prevDiffTime !== null && 13000 <= prevDiffTime && prevDiffTime <= 20000
          ? prevDiffTime
          : 18000 // 過度なアクセスをすると物理的に怒られる

      if (this._prev.date === null || feedGeneratedTimestamp.isAfter(this._prev.date)) {
        let buses: Vehicle[] = []

        for (const { vehicle } of vehiclePositions.entity) {
          if (vehicle === undefined) continue

          const tripUpdate = tripUpdates.entity.find(
            ({ trip_update }) =>
              trip_update !== undefined && trip_update.trip.trip_id === vehicle.trip!.trip_id
          ) as
            | {
                id: string
                is_deleted?: boolean
                trip_update: TripUpdate
              }
            | undefined
          if (tripUpdate === undefined) continue

          const stopTimeUpdate:
            | StopTimeUpdate
            | undefined = tripUpdate.trip_update.stop_time_update!.find(
            ({ stop_sequence }) =>
              stop_sequence !== undefined && stop_sequence === vehicle.current_stop_sequence
          )
          if (stopTimeUpdate === undefined) continue

          let routeId: string
          if ('route_id' in vehicle.trip!) routeId = vehicle.trip!.route_id!
          else {
            const trips:
              | {
                  [tripId: string]: GtfsTrip
                }
              | undefined = await getTrips().then(trips =>
              Object.values(trips[this.name]).find(route => vehicle.trip!.trip_id! in route)
            )

            if (trips === undefined || trips[vehicle.trip!.trip_id!] === undefined) continue

            routeId = trips[vehicle.trip!.trip_id!].route_id
          }

          const startDate = moment(
            vehicle.trip!.start_date! + vehicle.trip!.start_time!,
            'YYYYMMDDhh:mm:ss'
          )

          const currentStop = await getRoutesStops(this.name, routeId, startDate).then(
            ([route]) =>
              route.find(({ sequence }) => sequence === vehicle.current_stop_sequence) as RouteStop
          )

          buses.push(
            await createVehicle(this.name, routeId, startDate, {
              secondsDelay: stopTimeUpdate.arrival!.delay!,
              location: {
                lat: vehicle.position!.latitude,
                lon: vehicle.position!.longitude
              },
              currentStop: {
                sequence: vehicle.current_stop_sequence!,
                passedDate: moment(currentStop.date.schedule).add(
                  stopTimeUpdate.arrival!.delay,
                  's'
                )
              },
              descriptors: {
                id: vehicle.vehicle!.id,
                label: vehicle.vehicle!.label,
                licensePlate: vehicle.vehicle!.license_plate
              }
            })
          )
        }

        this.save(
          JSON.stringify(vehiclePositions),
          'json',
          feedGeneratedTimestamp,
          false,
          '/vehicle_positions/'
        )
        this.save(
          JSON.stringify(tripUpdates),
          'json',
          feedGeneratedTimestamp,
          false,
          '/trip_updates/'
        )

        this.updateData(buses, feedGeneratedTimestamp)

        if (this._prev.date) {
          this._changeTimes.push(feedGeneratedTimestamp.diff(this._prev.date))
          if (10 < this._changeTimes.length) this._changeTimes.shift()
        }
      }

      process.env.NODE_ENV !== 'production' &&
        process.stdout.write(
          `${this.name}: It gets the data after ${awaitTime / 1000} seconds. ${prevDiffTime}`
        )

      setTimeout(this.loop.bind(this), awaitTime)
    } catch (err) {
      console.warn(err)
      setTimeout(this.loop.bind(this), 3000)
    }
  }
}
