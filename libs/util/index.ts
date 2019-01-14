import * as createHttpError from 'http-errors'
import * as moment from 'moment'
import { Server as socketIoServer } from 'socket.io'

import {
  BroadcastBus,
  BroadcastBusStop,
  BroadcastLocation,
  BroadcastStop,
  EmitPositions
} from '../../interfaces'
import direction from '../../libs/direction'
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
import { RouteStop } from '../route'

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

export function locationToBroadcastLocation({
  lat,
  lon
}: {
  lat: number
  lon: number
}): BroadcastLocation {
  return {
    latitude: lat,
    lat: lat,
    longitude: lon,
    lon: lon,
    lng: lon,
    long: lon
  }
}

export async function createBusToBroadcastBus(bus: Vehicle): Promise<BroadcastBus> {
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
  ].find(stop => (bus.passedStop as BroadcastBusStop<true>).date.schedule === stop.arrival_time)

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
        delay: bus.delay as number,
        route: {
          id: bus.routeId
        },
        direction: await direction(
          (bus.passedStop as BroadcastBusStop<true>).location,
          (bus.nextStop as RouteStop).location,
          bus.location as { lat: number; lon: number }
        ),
        stations: bus.stations.map(station => station.id),
        location: locationToBroadcastLocation(bus.location as { lat: number; lon: number }),
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
              (await getStops())[bus.companyName][(bus.passedStop as BroadcastBusStop<true>).id]
            )),
            date: (bus.passedStop as BroadcastBusStop<true>).date
          },
          next: {
            ...(await stopToBroadcastStop(
              bus.companyName,
              (await getStops())[bus.companyName][(bus.nextStop as RouteStop).id]
            )),
            date: (bus.nextStop as RouteStop).date
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

export function ioEmitBus(io: socketIoServer, companyName: string, buses: BroadcastBus[]) {
  io.to(companyName).emit('bus', {
    company_name: companyName,
    buses
  } as EmitPositions)
}
