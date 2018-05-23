import { h24ToLessH24, dateToServiceIds } from './util'

import * as _moment from 'moment'
import { extendMoment } from 'moment-range'

import { isHoliday } from 'japanese-holidays'

import _stopTimes from './gtfs_loader/stop_times'
import { default as _stops } from './gtfs_loader/stops'
import _translations from './gtfs_loader/translation'
import _trips from './gtfs_loader/trips'
import _calendar from './gtfs_loader/calendar'

import { Ierror, broadcastBusStop } from '../interfaces'

const moment = extendMoment(_moment)

export default async function(
  companyName: string,
  routeNum: number | string,
  date: _moment.Moment
): Promise<broadcastBusStop[]> {
  const [stopTimes, stops, translations, trips] = await Promise.all([
    _stopTimes(),
    _stops(),
    _translations(),
    _trips(),
    _calendar()
  ])

  const trip = await dateToServiceIds(companyName, date).then(days =>
    Object.values(trips[companyName][routeNum]).find(trip => days.includes(trip.service_id))
  )

  if (!trip) {
    console.log(companyName, routeNum)

    const err: Ierror = new Error('There is no such route.')
    err.code = 404
    return Promise.reject(err)
  }

  return stopTimes[companyName][trip.trip_id].map(stop => {
    return {
      id: stop.stop_id,
      name: Object.assign(
        { ja: '', 'ja-Hira': '', en: undefined },
        translations[companyName][stops[companyName][stop.stop_id].stop_name]
      ),
      date: {
        schedule: stop.arrival_time
      },
      location: {
        lat: stops[companyName][stop.stop_id].stop_lat,
        lon: stops[companyName][stop.stop_id].stop_lon
      }
    }
  })
}
