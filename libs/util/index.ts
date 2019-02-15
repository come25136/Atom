import { Distance, findNearest, getRhumbLineBearing, isPointInLine, orderByDistance } from 'geolib'
import * as createHttpError from 'http-errors'
import * as moment from 'moment'
import { Server as socketIoServer } from 'socket.io'

import {
  BroadcastLocation,
  BroadcastStop,
  BroadcastVehicle,
  BroadcastVehicleStop,
  EmitPositions,
  Location,
  Stop
} from '../../interfaces'
import { Vehicle } from '../classes/create_vehicle'
import {
  getCalendarDates,
  getCalendars,
  getStops,
  getStopTimes,
  getTranslations,
  getTrips,
  GtfsStop,
  GtfsStopTime,
  GtfsTrip
} from '../gtfs/static'
import { getShapes, GetShapes, RouteStop } from '../route'

export * from './translate'

export function getDataDir(): string {
  const dataDir = process.env.DATA || './data'

  return dataDir.slice(-1) === '/' ? dataDir.slice(0, -1) : dataDir
}

/**
 * @param date 00:00:00
 * @param standard
 */
export function h24ToLessH24(
  _time: string,
  standard: moment.Moment = moment(),
  override: boolean = true,
  subtract: boolean = false
): moment.Moment {
  const timeSplit = _time.split(':')
  const time = {
    hour: Number(timeSplit[0]),
    minute: Number(timeSplit[1] || 0),
    second: Number(timeSplit[2] || 0)
  }

  return override
    ? subtract
      ? standard
          .clone()
          .subtract(Math.floor(time.hour / 24), 'd')
          .hour(
            1 <= time.hour / 24 ? (time.hour / 24 - Math.floor(time.hour / 24)) * 24 : time.hour
          )
          .minute(time.minute)
          .second(time.second)
      : standard
          .clone()
          .hour(time.hour)
          .minute(time.minute)
          .second(time.second)
    : standard
        .clone()
        .add(time.hour, 'h')
        .add(time.minute, 'm')
        .add(time.second, 's')
}

function dot(v1: [number, number], v2: [number, number]) {
  return v1[0] * v2[0] + v1[1] * v2[1]
}

// https://jsfiddle.net/soulwire/UA6H5/
function closestPoint(
  location: Location,
  p1: Location,
  p2: Location
): {
  location: Location
  isLeft: boolean
  dot: number
  t: number
} {
  const atob = { x: p2.lon - p1.lon, y: p2.lat - p1.lat }
  const atop = { x: location.lon - p1.lon, y: location.lat - p1.lat }
  const len = atob.x * atob.x + atob.y * atob.y
  let dot = atop.x * atob.x + atop.y * atob.y
  const t = dot / len

  dot = (p2.lon - p1.lon) * (location.lat - p1.lat) - (p2.lat - location.lat) * (p1.lon - p1.lon)

  return {
    location: {
      lat: p1.lat + atob.y * t,
      lon: p1.lon + atob.x * t
    },
    isLeft: dot < 1,
    dot: dot,
    t: t
  }
}

function a(routeStop1: Stop, routeStop2: Stop, shape: GetShapes) {
  const shapes = shape.coordinates.map(({ location }) => ({
    latitude: location.lat,
    longitude: location.lon
  }))

  const pointsNearPassStop = (findNearest(
    {
      latitude: routeStop1.location.lat,
      longitude: routeStop1.location.lon
    },
    shapes
  ) as unknown) as Distance

  const pointsNearNextStop = (findNearest(
    {
      latitude: routeStop2.location.lat,
      longitude: routeStop2.location.lon
    },
    shapes
  ) as unknown) as Distance

  let betweenPassStopAndNextStop: boolean = false

  const shapesBetweenPassStopPointAndNextStopPoint = shape.coordinates.filter(({ location }) => {
    if (
      betweenPassStopAndNextStop === false &&
      (location.lat === pointsNearPassStop.latitude &&
        location.lon === pointsNearPassStop.longitude)
    )
      return (betweenPassStopAndNextStop = true)

    if (
      betweenPassStopAndNextStop &&
      location.lat === pointsNearNextStop.latitude &&
      location.lon === pointsNearNextStop.longitude
    ) {
      betweenPassStopAndNextStop = false

      return true
    }

    return betweenPassStopAndNextStop
  })

  return shapesBetweenPassStopPointAndNextStopPoint
}

export async function correctionPosition(
  companyName: string,
  routeId: string,
  route: RouteStop[],
  passStop: Stop,
  position: Location
): Promise<{
  location: Location
  p0: Location
  p1: Location
}> {
  let passStopIndex: number = route.findIndex(routeStop => routeStop.id === passStop.id)
  passStopIndex = 0 < passStopIndex ? passStopIndex - 1 : 0 // 停留所通過しても通過ボタンすぐに押さないからその為のコード

  let nextStopIndex: number = passStopIndex + 1

  for (let i = 0; i < 5; i++) {
    if (route[passStopIndex + i + 1] === undefined) break
    passStopIndex = passStopIndex + i

    nextStopIndex = passStopIndex + 1

    const shape = await getShapes(companyName, routeId)

    const shapesBetweenPassStopPointAndNextStopPoint = a(
      route[passStopIndex],
      route[nextStopIndex],
      shape
    )

    for (let i = 0; i < shapesBetweenPassStopPointAndNextStopPoint.length - 1; i++) {
      const correctionAfterPosition = closestPoint(
        position,
        shapesBetweenPassStopPointAndNextStopPoint[i].location,
        shapesBetweenPassStopPointAndNextStopPoint[i + 1].location
      )

      if (correctionAfterPosition.t < 0 || 1 < correctionAfterPosition.t) continue

      return {
        location: correctionAfterPosition.location,
        p0: shapesBetweenPassStopPointAndNextStopPoint[i].location,
        p1: shapesBetweenPassStopPointAndNextStopPoint[i + 1].location
      }
    }
  }

  return {
    location: position,
    p0: route[passStopIndex].location,
    p1: route[nextStopIndex].location
  }
}

export async function direction(
  companyName: string,
  routeId: string,
  route: RouteStop[],
  passStop: BroadcastVehicleStop | BroadcastVehicleStop<true>,
  position: Location
): Promise<number> {
  const { location, p1 } = await correctionPosition(companyName, routeId, route, passStop, position)

  const bearing = getRhumbLineBearing(
    { latitude: location.lat, longitude: location.lon },
    { latitude: p1.lat, longitude: p1.lon }
  )

  return bearing
}

export function locationToBroadcastLocation({ lat, lon }: Location): BroadcastLocation {
  return {
    latitude: lat,
    lat: lat,
    longitude: lon,
    lon: lon,
    lng: lon,
    long: lon
  }
}

export async function createBusToBroadcastVehicle(bus: Vehicle): Promise<BroadcastVehicle> {
  if (bus.isRun === false)
    return {
      run: false,
      route: {
        id: bus.routeId
      },
      stations: bus.stations.map(station => station.id),
      stops: {
        first: {
          ...(await stopToBroadcastStop(
            bus.companyName,
            (await getStops())[bus.companyName][bus.firstStop.id]
          )),
          date: bus.firstStop.date
        },
        last: {
          ...(await stopToBroadcastStop(
            bus.companyName,
            (await getStops())[bus.companyName][bus.lastStop.id]
          )),
          date: bus.lastStop.date
        }
      }
    }

  const trip: GtfsTrip | undefined = await dateToServiceIds(bus.companyName, bus.startDate).then(
    async days =>
      getTrips().then(trips =>
        Object.values(trips[bus.companyName][bus.routeId]).find(trip =>
          days.includes(trip.service_id)
        )
      )
  )

  if (trip === undefined) throw createHttpError(404, `Not trip: ${bus.companyName} ${bus.routeId}`)

  const passedHeadsign: GtfsStopTime | undefined = (await getStopTimes())[bus.companyName][
    trip.trip_id
  ].find(stop => bus.passedStop!.date.schedule === stop.arrival_time)

  return bus.isRun
    ? {
        run: true,
        descriptors: {
          id: bus.id,
          label: bus.label,
          license_plate: bus.licensePlate
        },
        headsign:
          passedHeadsign && passedHeadsign.stop_headsign
            ? passedHeadsign.stop_headsign
            : trip.trip_headsign || null,
        delay: bus.delay!,
        route: {
          id: bus.routeId
        },
        direction: await direction(
          bus.companyName,
          bus.routeId,
          bus.route,
          bus.passedStop!,
          bus.location!
        ),
        stations: bus.stations.map(station => station.id),
        location: locationToBroadcastLocation(bus.location!),
        stops: {
          first: {
            ...(await stopToBroadcastStop(
              bus.companyName,
              (await getStops())[bus.companyName][bus.firstStop.id]
            )),
            date: bus.firstStop.date
          },
          passed: {
            ...(await stopToBroadcastStop(
              bus.companyName,
              (await getStops())[bus.companyName][bus.passedStop!.id]
            )),
            date: bus.passedStop!.date
          },
          next: {
            ...(await stopToBroadcastStop(
              bus.companyName,
              (await getStops())[bus.companyName][bus.nextStop!.id]
            )),
            date: bus.nextStop!.date
          },
          last: {
            ...(await stopToBroadcastStop(
              bus.companyName,
              (await getStops())[bus.companyName][bus.lastStop.id]
            )),
            date: bus.lastStop.date
          }
        }
      }
    : {
        run: false,
        route: {
          id: bus.routeId
        },
        stations: bus.stations.map(station => station.id),
        stops: {
          first: {
            ...(await stopToBroadcastStop(
              bus.companyName,
              (await getStops())[bus.companyName][bus.firstStop.id]
            )),
            date: bus.firstStop.date
          },
          last: {
            ...(await stopToBroadcastStop(
              bus.companyName,
              (await getStops())[bus.companyName][bus.lastStop.id]
            )),
            date: bus.lastStop.date
          }
        }
      }
}

export async function stopToBroadcastStop(
  companyName: string,
  stop: GtfsStop
): Promise<BroadcastStop> {
  return {
    id: stop.stop_id,
    name: await getTranslations().then(data => data[companyName][stop.stop_name]),
    location: locationToBroadcastLocation({
      lat: stop.stop_lat,
      lon: stop.stop_lon
    })
  }
}

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export async function dateToServiceIds(
  companyName: string,
  date: moment.Moment
): Promise<string[]> {
  const [calendar, calendar_dates] = await Promise.all([getCalendars(), getCalendarDates()])

  return Object.values(calendar[companyName])
    .filter(calendar => {
      if (date.isBetween(calendar.start_date, calendar.end_date) === false) return

      // calendar_datesで上書き可能
      const base =
        calendar[
          dayNames[date.day()] as
            | 'sunday'
            | 'monday'
            | 'tuesday'
            | 'wednesday'
            | 'thursday'
            | 'friday'
            | 'saturday'
        ]

      // undefinedの可能性あり
      const calendarDate = calendar_dates[companyName][calendar.service_id]

      const add =
        calendarDate &&
        calendarDate.some(
          service => date.isSame(service.date, 'day') && service.exception_type === 1
        )

      const remove =
        calendarDate &&
        calendarDate.some(
          service => date.isSame(service.date, 'day') && service.exception_type === 2
        )

      if (add) return true
      if (remove) return false

      return base
    })
    .map(row => row.service_id)
}

export function ioEmitBus(io: socketIoServer, companyName: string, buses: BroadcastVehicle[]) {
  io.to(companyName).emit('bus', {
    company_name: companyName,
    buses
  } as EmitPositions)
}

export function convertStringFullWidthToHalfWidth<char extends string | null>(
  char: char
): string | char {
  return typeof char === 'string'
    ? char
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
        .replace(/（(.*)）/, '($1)')
        .replace(/(\S)(?!\s)(\()/, '$1 $2')
        .replace(/(\))(?!\s)(\S)/, '$1 $2')
    : char
}
