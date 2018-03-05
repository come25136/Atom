import * as moment from 'moment'

import { isHoliday } from 'japanese-holidays'

import { default as translations, Inames } from '../GTFS_loader/translation'
import stops from '../GTFS_loader/stops'
import stopTimes from '../GTFS_loader/stop_times'

interface Istop {
  name: Inames
  time: string
  lat: number
  lon: number
}

let cache: [
  Map<string, Inames>,
  Map<string, {
    stop_id: string
    stop_code: string
    stop_name: string
    stop_desc: null
    stop_lat: number
    stop_lon: number
    zone_id: string
    stop_url: null
    location_type: number
  }>,
  Map<string, {
    [key: string]: {
      trip_id: string
      arrival_time: string
      departure_time: string
      stop_id: string
      stop_sequence: number
      stop_headsign: string
      pickup_type: number
      drop_off_type: number
    }[]
  }>
]


export default (line: number | string, date: string) => new Promise<Istop[]>(resolve => {
  cache
    ? getSteps()
    : Promise.all([translations, stops, stopTimes,])
      .then(data => {
        cache = data
        getSteps()
      })

  function getSteps(): Istop[] | undefined {
    const
      [translations, stops, stopTimes] = cache,
      _date = moment(date),
      routes = stopTimes.get(`${_date.day() === 0 || _date.day() === 6 || isHoliday(_date.toDate()) ? 'holiday' : 'weekday'}_${line}`)

    if (!routes) return

    const _time = _date.format('HH:mm')

    if (!routes[_time]) console.log(routes)

    resolve(routes[_time].map(stop_raw => {
      const stop = stops.get(stop_raw.stop_id) || {
        stop_name: '',
        stop_lat: 0,
        stop_lon: 0
      }

      return {
        name: Object.assign({ ja: '', 'ja-Hrkt': '', en: '' }, translations.get(stop.stop_name)),
        time: moment(stop_raw.arrival_time, 'HH:mm:ss').toISOString(),
        lat: stop.stop_lat,
        lon: stop.stop_lon
      }
    }))
  }
})
