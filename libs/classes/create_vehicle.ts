import { Location, RouteStop, RouteStopSchedule } from '@come25136/gtfs'
import { getRhumbLineBearing } from 'geolib'
import * as createHttpError from 'http-errors'
import * as _ from 'lodash'
import * as moment from 'moment-timezone'
import { getManager } from 'typeorm'

import { Agency } from '../../db/entitys/gtfs/agency'
import { Shape } from '../../db/entitys/gtfs/shape'
import { StopTime } from '../../db/entitys/gtfs/stop_time'
import { Trip } from '../../db/entitys/gtfs/trip'
import { correctionPosition } from '../../libs/gtfs/util'
import { StopTimeUpdate } from '../gtfs/realtime'
import { h24ToLessH24, objSnakeCase } from '../util'

interface Expansion {
  network?: {}
  terminal?: {
    type: 'electrical_outlet-A'
    voltage: number
    ampere: number
  }[] // コンセント(100V)とUSB(5V)などが混合している場合を想定した配列
}

interface Descriptors {
  // https://developers.google.com/transit/gtfs-realtime/reference/?hl=ja#message_vehicledescriptor
  id?: string
  label?: string
  licensePlate?: string
  expansion?: Expansion
}

export class VehicleNotDriving {
  readonly isDriving: boolean = false // 運休の場合false
  protected _startDate: moment.Moment

  constructor(
    readonly remoteUid: number,
    readonly _route: {
      trip: Trip
      calcStops: RouteStopSchedule[]
    }
  ) {
    this._startDate = _route.calcStops[0].date.departure.schedule
  }

  get startDate(): moment.Moment {
    return this._startDate
  }

  get tripId(): string {
    return this._route.trip.id
  }

  get firstStop(): RouteStopSchedule {
    return this._route.calcStops[0]
  }

  get lastStop(): RouteStopSchedule {
    return this._route.calcStops[this._route.calcStops.length - 1]
  }

  get routeStops(): RouteStopSchedule[] {
    return this._route.calcStops
  }

  get public() {
    return {
      run: this.isDriving,
      trip: {
        id: this.tripId
      }
    }
  }
}

export class Vehicle extends VehicleNotDriving {
  isDriving: true = true
  private _delay: number
  private _bearing: number
  private _location: Location
  private _passed: RouteStop<true>
  private _nextIndex: number
  private _descriptors: Descriptors = {}

  constructor(
    readonly remoteUid: number,
    route: {
      trip: Trip
      calcStops: RouteStopSchedule[]
      shapes: Shape[]
    },
    vehicle: {
      delay: number
      bearing?: number
      location: Location
      passed: { index: number; stop: RouteStop<true> }
      descriptors?: Descriptors
    }
  ) {
    super(remoteUid, route)

    this._delay = vehicle.delay
    this._location = vehicle.location
    this._descriptors = vehicle.descriptors || {}

    this._passed = vehicle.passed.stop

    const nextIndex = vehicle.passed.index + 1

    if (route.calcStops.length < nextIndex + 1)
      throw createHttpError(416, 'This car has already arrived at the final stop.')

    this._nextIndex = nextIndex

    const { location, p1 } = correctionPosition(
      route.calcStops,
      route.shapes,
      this._passed,
      this.location
    )

    this.location = location

    this._bearing =
      vehicle.bearing === undefined
        ? getRhumbLineBearing(
          { latitude: location.lat, longitude: location.lon },
          { latitude: p1.lat, longitude: p1.lon }
        )
        : vehicle.bearing
  }

  get id(): string | null {
    return this._descriptors.id || null
  }

  get label(): string | null {
    return this._descriptors.label || null
  }

  get licensePlate(): string | null {
    return this._descriptors.licensePlate || null
  }

  get delay(): number {
    return this._delay
  }

  get location(): Location {
    return this._location
  }

  set location(location: Location) {
    this._location = location
  }

  get bearing(): number {
    return this._bearing
  }

  get passedStop(): RouteStop<true> {
    return this._passed
  }

  get nextStop(): RouteStop {
    return this._route.calcStops[this._nextIndex]
  }

  get expansion(): Expansion {
    return this._descriptors.expansion || {}
  }

  static async create(
    remoteUid: number,
    tripOrRoute:
      | {
        tripId: string
        standardDate?: moment.Moment
      }
      | {
        routeId: string
        firstStop: {
          date: moment.Moment
          time?: {
            arrival?: moment.Moment
          } & {
            departure?: moment.Moment
          } & {
            arrival?: moment.Moment
            departure?: moment.Moment
          }
        }
      },
    vehicle?: {
      delay: number
      bearing?: number
      location: Location
      passedStop: StopTimeUpdate
      descriptors?: Descriptors
    }
  ): Promise<Vehicle | VehicleNotDriving> {
    const _vehicle = await getManager().transaction(async trn => {
      let [route] = await Trip.findRoutes(remoteUid, tripOrRoute, trn)

      route.trip.id

      if (vehicle === undefined) return new VehicleNotDriving(remoteUid, route)

      const stopTimeRepo = trn.getRepository(StopTime)

      const passedStop = await ('stop_sequence' in vehicle.passedStop
        ? stopTimeRepo.findOne({
          remote: { uid: remoteUid },
          trip: route.trip,
          sequence: vehicle.passedStop.stop_sequence
        })
        : stopTimeRepo.findOne({
          remote: { uid: remoteUid },
          trip: route.trip,
          stopId: vehicle.passedStop.stop_id
        }))

      if (passedStop === undefined) throw createHttpError(404, 'passed stop not found.')

      const agency = await trn.getRepository(Agency).findOne({ remote: { uid: remoteUid } })

      // tripIdしか無い場合は、運行状況から運行開始日を算出する
      if ('tripId' in tripOrRoute) {
        const startDate = h24ToLessH24(
          passedStop.departureTime || passedStop.arrivalTime,
          moment.tz(agency.timezone),
          true,
          true
        )

        route = (
          await Trip.findRoutes(
            remoteUid,
            {
              tripId: tripOrRoute.tripId,
              standardDate: startDate
            },
            trn
          )
        )[0]
      }

      const paseedStopIndex = route.calcStops.findIndex(
        ({ sequence }) => sequence === passedStop.sequence
      )

      const shapes = await trn
        .getRepository(Shape)
        .find({ remote: { uid: remoteUid }, id: route.trip.shapeId })

      return new Vehicle(
        remoteUid,
        {
          ...route,
          shapes
        },
        {
          ...vehicle,
          passed: {
            index: paseedStopIndex,
            stop: _.merge(route.calcStops[paseedStopIndex], {
              date: {
                arrival: {
                  decision:
                    'arrival' in vehicle.passedStop
                      ? 'time' in vehicle.passedStop.arrival
                        ? moment(vehicle.passedStop.arrival.time)
                        : passedStop.arrivalTime.clone().add(vehicle.passedStop.arrival.delay, 's')
                      : undefined
                },
                departure: {
                  decision:
                    'departure' in vehicle.passedStop
                      ? 'time' in vehicle.passedStop.departure
                        ? moment(vehicle.passedStop.departure.time)
                        : passedStop.departureTime
                          .clone()
                          .add(vehicle.passedStop.departure.delay, 's')
                      : undefined
                }
              }
            })
          }
        }
      )
    })

    return _vehicle
  }

  static calcPassedStop(
    routeStops: RouteStop[],
    stopTimeUpdate: StopTimeUpdate
  ): { sequence: number; stop: RouteStop<true> } {
    const passedStopIndex = routeStops.findIndex(stop =>
      stopTimeUpdate.stop_sequence
        ? stopTimeUpdate.stop_sequence === stop.sequence
        : stopTimeUpdate.stop_id === stop.id
    )

    if (passedStopIndex < 0) throw createHttpError(404, 'There\'s trip has no paseed stop.')

    return {
      sequence: passedStopIndex,
      stop: _.merge(routeStops[passedStopIndex], {
        date: {
          arrival: stopTimeUpdate.arrival
            ? {
              decision: stopTimeUpdate.arrival.time
                ? moment(stopTimeUpdate.arrival.time)
                : routeStops[passedStopIndex].date.arrival.schedule.add(
                  stopTimeUpdate.arrival.delay,
                  's'
                )
            }
            : undefined,
          departure: stopTimeUpdate.departure
            ? {
              decision: stopTimeUpdate.departure.time
                ? moment(stopTimeUpdate.departure.time)
                : routeStops[passedStopIndex].date.departure.schedule.add(
                  stopTimeUpdate.departure.delay,
                  's'
                )
            }
            : undefined
        }
      })
    }
  }

  get public() {
    return {
      run: this.isDriving,
      trip: {
        id: this.tripId
      },
      date: {
        start: this.firstStop.date.departure.schedule.format()
      },
      descriptors: objSnakeCase(this._descriptors),
      delay: this._delay,
      headsign: this.passedStop.headsign,
      bearing: this._bearing,
      location: this._location,
      stops: {
        passed: objSnakeCase(this.passedStop),
        next: objSnakeCase(this.nextStop)
      }
    }
  }
}
