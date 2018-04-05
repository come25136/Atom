import { h24ToLessH24 } from './util'

import * as _moment from 'moment'
import { extendMoment } from 'moment-range'

import { isHoliday } from 'japanese-holidays'

import { default as _translations, Inames } from './gtfs_loader/translation'
import { default as _stops, Istop as _Istop } from './gtfs_loader/stops'
import {
  default as _stopTimes,
  Istop as IstopTimes
} from './gtfs_loader/stop_times'

import { Ierror, Istop } from '../interfaces'

const moment = extendMoment(_moment)

let translations: { [k: string]: Inames },
  stops: { [k: string]: _Istop },
  stopTimes: { [key: string]: { [key: string]: IstopTimes[] } }

export default async (
  line: number | string,
  date: _moment.Moment
): Promise<Istop[]> => {
  if (!translations && !stops && !stopTimes)
    [translations, stops, stopTimes] = await Promise.all([
      _translations,
      _stops,
      _stopTimes
    ])

  const time = date.format('HH:mm'),
    routes =
      stopTimes[
        `${
          date.day() === 0 || date.day() === 6 || isHoliday(date.toDate())
            ? 'holiday'
            : 'weekday'
        }_${line}`
      ]

  if (!routes || !routes[time]) {
    console.log(line, date.format(), time, routes)

    const err: Ierror = new Error('There is no such route.')
    err.code = 404
    return Promise.reject(err)
  }

  return Promise.resolve(
    routes[time].map(stop_raw => {
      const stop = stops[stop_raw.stop_id] || {
        stop_id: '',
        stop_name: '',
        stop_lat: 0,
        stop_lon: 0
      }

      return {
        id: stop.stop_id,
        name: Object.assign(
          { ja: '', 'ja-Hrkt': '', en: undefined },
          translations[stop.stop_name]
        ),
        time: {
          schedule: stop_raw.arrival_time
        },
        location: {
          lat: stop.stop_lat,
          lon: stop.stop_lon
        }
      }
    })
  )
}
