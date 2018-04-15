import * as _moment from 'moment'
import { extendMoment } from 'moment-range'

import direction from '../libs/direction'

import { createBus } from './classes/create_bus'

import { Istop, broadcastLocation, broadcastStop, broadcastData } from '../interfaces'

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
export function h24ToLessH24(
  _time: string,
  standard: _moment.Moment = moment(),
  override: boolean = true
) {
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

export function stopToBroadcastStop(stop: Istop): broadcastStop {
  return Object.assign(stop, {
    location: locationToBroadcastLocation(stop.location)
  })
}

export function locationToBroadcastLocation({
  lat,
  lon
}: {
  lat: number
  lon: number
}): broadcastLocation {
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
  return {
    run: bus.isRun,
    license_number: bus.licenseNumber,
    delay: bus.delay,
    route_num: bus.routeNumber,
    direction: await direction(bus.passingStop.location, bus.nextStop.location, bus.location),
    stations: bus.stations.map(station => stopToBroadcastStop(station)),
    location: locationToBroadcastLocation(bus.location),
    stops: {
      first: bus.firstStop.id,
      passing: bus.passingStop.id,
      next: bus.nextStop.id,
      last: bus.lastStop.id
    }
  }
}
