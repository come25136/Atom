import * as moment from 'moment'

import { isHoliday } from 'japanese-holidays'

import { default as _translations, Inames } from '../GTFS_loader/translation'
import { default as _stops, Istop as _Istop } from '../GTFS_loader/stops'
import {
  default as _stopTimes,
  Istop as IstopTimes
} from '../GTFS_loader/stop_times'

import { Ierror } from '../interfaces'

interface Istop {
  id: string
  name: Inames
  time: string
  lat: number
  lon: number
}

let translations: { [k: string]: Inames },
  stops: { [k: string]: _Istop },
  stopTimes: { [key: string]: { [key: string]: IstopTimes[] } }

export default async (
  line: number | string,
  _date: string
): Promise<Istop[]> => {
  if (!translations && !stops && !stopTimes)
    [translations, stops, stopTimes] = await Promise.all([
      _translations,
      _stops,
      _stopTimes
    ])

  const date = moment(_date),
    time = date.format('HH:mm'),
    routes =
      stopTimes[
        `${
          date.day() === 0 || date.day() === 6 || isHoliday(date.toDate())
            ? 'holiday'
            : 'weekday'
        }_${line}`
      ]

  if (!routes || !routes[time]) {
    console.log(routes)

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
          { ja: '', 'ja-Hrkt': '', en: '' },
          translations[stop.stop_name]
        ),
        time: moment(stop_raw.arrival_time, 'HH:mm:ss').toISOString(),
        lat: stop.stop_lat,
        lon: stop.stop_lon
      }
    })
  )
}
