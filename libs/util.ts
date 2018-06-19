import * as _moment from 'moment'
import { extendMoment } from 'moment-range'

import direction from '../libs/direction'

import { createBus } from './classes/create_bus'

import { broadcastLocation, broadcastData, broadcastBusStop, stop } from '../interfaces'
import { Istop } from './gtfs_loader/stops'
import translation from './gtfs_loader/translation'

import calendar from './gtfs_loader/calendar'
import calendar_dates from './gtfs_loader/calendar_dates'
import route from './route'
import trips from './gtfs_loader/trips'
import stopTimes from './gtfs_loader/stop_times'

const moment = extendMoment(_moment)

export function getDataDir() {
  const dataDir = process.env.DATA || './data'

  return dataDir.slice(-1) === '/' ? dataDir.slice(0, -1) : dataDir
}

export function mapToObj<T>(map: Map<string, T>) {
  return [...map].reduce((prev, [k, v]) => ({ ...prev, [k]: v }), {})
}

/**
 * @param date 00:00:00
 * @param standard
 */
export function h24ToLessH24(_time: string, standard: _moment.Moment = moment(), override: boolean = true) {
  const timeSplit = _time.split(':'),
    time = {
      hour: Number(timeSplit[0]),
      minute: Number(timeSplit[1] || 0),
      second: Number(timeSplit[2] || 0)
    }

  return override
    ? standard
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

export function locationToBroadcastLocation({ lat, lon }: { lat: number; lon: number }): broadcastLocation {
  return {
    latitude: lat,
    lat: lat,
    longitude: lon,
    lon: lon,
    lng: lon,
    long: lon
  }
}

export async function createBusToBroadcastObject(bus: createBus): Promise<broadcastData> {
  const trip = await dateToServiceIds(bus.companyName, bus.standardDate).then(async days =>
    Object.values((await trips())[bus.companyName][bus.routeNumber]).find(trip => days.includes(trip.service_id))
  )

  if (!trip || !trip.trip_id) throw new Error('not trip')

  const passingHeadsign = (await stopTimes())[bus.companyName][trip.trip_id].find(
    stop => bus.passingStop.date.schedule === stop.arrival_time
  )

  return {
    run: bus.isRun,
    license_number: bus.licenseNumber,
    rollsign: passingHeadsign && passingHeadsign.stop_headsign ? passingHeadsign.stop_headsign : trip.trip_headsign,
    delay: bus.delay,
    route_num: bus.routeNumber,
    direction: await direction(bus.passingStop.location, bus.nextStop.location, bus.location),
    stations: bus.stations.map(station => station.id),
    location: locationToBroadcastLocation(bus.location),
    stops: {
      first: {
        id: bus.firstStop.id,
        date: bus.firstStop.date
      },
      passing: {
        id: bus.passingStop.id,
        date: bus.passingStop.date
      },
      next: {
        id: bus.nextStop.id,
        date: bus.nextStop.date
      },
      last: {
        id: bus.lastStop.id,
        date: bus.lastStop.date
      }
    }
  }
}

export async function stopToBroadcastStop(companyName: string, stop: Istop): Promise<stop> {
  return {
    id: stop.stop_id,
    name: await translation().then(data => data[companyName][stop.stop_name]),
    location: locationToBroadcastLocation({
      lat: stop.stop_lat,
      lon: stop.stop_lon
    })
  }
}

export async function dateToServiceIds(companyName: string, date: _moment.Moment) {
  const _calendar = await calendar(),
    _calendar_dates = await calendar_dates(),
    dateString = date.format('YYYYMMDD')

  return Object.values(_calendar[companyName])
    .filter(
      service =>
        _calendar_dates[companyName][service.service_id]
          ? _calendar_dates[companyName][service.service_id].some(
              service => dateString === service.date && service.exception_type === 1
            ) ||
            (moment
              .range(moment(service.start_date, 'YYYYMMDD'), moment(service.end_date, 'YYYYMMDD'))
              .contains(date) &&
              (!_calendar_dates[companyName][service.service_id].some(
                service => dateString === service.date && service.exception_type === 2
              ) &&
                service[
                  ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.day()] as
                    | 'sunday'
                    | 'monday'
                    | 'tuesday'
                    | 'wednesday'
                    | 'thursday'
                    | 'friday'
                    | 'saturday'
                ] === 1))
          : true
    )
    .map(row => row.service_id)
}
