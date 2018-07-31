import { dateToServiceIds } from './util'

import * as moment from 'moment'

import _stopTimes from './gtfs_loader/stop_times'
import { default as _stops } from './gtfs_loader/stops'
import _translations from './gtfs_loader/translation'
import __trips from './gtfs_loader/trips'
import _calendar from './gtfs_loader/calendar'

import _shapes from './gtfs_loader/shapes'

import { Ierror, busDate, stop } from '../interfaces'

export interface route extends stop {
  date: busDate
}

export default async function(
  companyName: string,
  routeNum: string,
  firstStopDate: moment.Moment,
  dayOnly: boolean = false
): Promise<route[][]> {
  const [stopTimes, stops, translations, _trips] = await Promise.all([
    _stopTimes(),
    _stops(),
    _translations(),
    __trips(),
    _calendar()
  ])

  const trips = await dateToServiceIds(companyName, firstStopDate).then(
    days =>
      _trips[companyName][routeNum]
        ? Object.values(_trips[companyName][routeNum]).filter(
            trip =>
              days.includes(trip.service_id) && dayOnly
                ? true
                : firstStopDate.format('HH:mm:ss') ===
                  stopTimes[companyName][trip.trip_id][0].arrival_time
          )
        : []
  )

  if (trips.length === 0) {
    if (process.env.NODE_ENV !== 'test') console.warn(companyName, routeNum)

    const err: Ierror = new Error('There is no such route.')
    err.code = 404
    return Promise.reject(err)
  }

  return trips.map(trip =>
    stopTimes[companyName][trip.trip_id].map(stop => ({
      id: stop.stop_id,
      name: translations[companyName][stops[companyName][stop.stop_id].stop_name],
      date: {
        schedule: stop.arrival_time
      },
      location: {
        lat: stops[companyName][stop.stop_id].stop_lat,
        lon: stops[companyName][stop.stop_id].stop_lon
      }
    }))
  )
}

export async function getGeo(companyName: string, routeNum: string) {
  const shapes = await _shapes()

  if (!shapes[companyName][routeNum]) {
    const err: Ierror = new Error('There is no such route.')
    err.code = 404
    return Promise.reject(err)
  }

  return {
    type: 'FeatureCollection',
    features: {
      id: routeNum,
      type: 'Feature',
      properties: {
        shape_id: routeNum
      },
      geometry: {
        type: 'LineString',
        coordinates: shapes[companyName][routeNum].map(shape => [
          shape.shape_pt_lon,
          shape.shape_pt_lat
        ])
      }
    }
  }
}
