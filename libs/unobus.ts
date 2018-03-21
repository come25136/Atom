import * as util from 'util'

import * as superagent from 'superagent'

import * as csvParse from 'csv-parse'

import * as _moment from 'moment'
import { extendMoment } from 'moment-range'

import { isHoliday } from 'japanese-holidays'

import {
  default as _stopTimes,
  Istop as IstopTimes
} from '../GTFS_loader/stop_times'
import { default as _stops, Istop as _Istop } from '../GTFS_loader/stops'
import { default as _translations, Inames } from '../GTFS_loader/translation'

import route from '../libs/route'
import direction from './direction'

import { Ierror, Ibus } from '../interfaces'

interface IbusRaw {
  route_num: number
  okayama_stop_time: string
  delay: number
  run: string
  passing_stop: string
  license_number: number
  lat: number
  lon: number
  first_stop: string
  final_stop: string
}

const csvParser = util.promisify<string, csvParse.Options, IbusRaw[]>(csvParse),
  moment = extendMoment(_moment)

let stopTimes: { [key: string]: { [key: string]: IstopTimes[] } },
  stops: { [k: string]: _Istop },
  translations: { [k: string]: Inames }

let cache: {
  time: {
    latest: _moment.Moment
    diff?: number
  }
  data: string
}

export const get = async (
  data?: string,
  date?: string
): Promise<{
  change: boolean
  buses: Map<number, Ibus>
  time: { latest: _moment.Moment; diff?: number }
  raw: string
}> => {
  ;[stopTimes, stops, translations] = await Promise.all([
    _stopTimes,
    _stops,
    _translations
  ])

  const res = data
    ? { text: data }
    : await superagent.get('http://www3.unobus.co.jp/GPS/unobus.txt')
  let change = false

  if (!/\/\/LAST/.test(res.text)) {
    const error: Ierror = new Error('Server side processing is not completed.')
    error.code = 202
    throw error
  }

  const time = date ? moment(date) : moment(res.text.substr(1, 8), 'HH:mm:ss')

  if (!cache) cache = { time: { latest: time }, data: res.text }

  if (res.text.substr(9) !== cache.data.substr(9)) {
    change = true
    cache = {
      time: {
        latest: time,
        diff: time.diff(cache.time.latest)
      },
      data: res.text
    }
  }

  const busesRaw: IbusRaw[] = await csvParser(res.text.substr(11), {
    columns: [
      'route_num',
      'okayama_stop_time',
      'delay',
      'run',
      'passing_stop',
      'license_number',
      'lat',
      'lon',
      'first_stop',
      'final_stop'
    ],
    comment: '//'
  })

  const day = isHoliday(moment().toDate()) ? 'holiday' : 'weekday',
    buses = new Map<number, Ibus>()

  for (const bus of busesRaw) {
    const first_stop = bus.first_stop.slice(3)

    if (bus.passing_stop.substr(13, 3) !== '《着》') {
      const stops = await route(
        bus.route_num,
        date
          ? moment(
              `${time.format('YYYY-MM-DD')} ${first_stop.substr(
                0,
                2
              )}:${first_stop.substr(3, 5)}`,
              'YYYY-MM-DD HH:mm'
            ).toISOString()
          : moment(first_stop.substr(0, 5), 'HH:mm').toISOString()
      )

      let passing: {
        id?: string
        name?: Inames
        time?: string
        pass_time?: string
      } = {}

      let next: {
        id?: string
        name?: Inames
        time?: string
      } = {}

      const passing_stop_name = (await translations[
        bus.passing_stop.substr(13)
      ]) || { ja: '' }

      stops.forEach(stop => {
        if (
          Object.keys(passing).length !== 0 &&
          Object.keys(next).length === 0
        ) {
          next = {
            id: stop.id,
            name: stop.name,
            time: stop.time
          }
        }

        if (passing_stop_name.ja === stop.name.ja) {
          passing = {
            id: stop.id,
            name: stop.name,
            time: stop.time,
            pass_time: moment(
              bus.passing_stop.slice(6, 11),
              'HH:mm'
            ).toISOString()
          }
        }
      })

      buses.set(bus.license_number, {
        route_num: bus.route_num,
        direction: await direction(
          passing.id ? passing.id : '',
          passing.id ? passing.id : '',
          bus
        ),
        okayama_stop_time: bus.okayama_stop_time
          ? moment(bus.okayama_stop_time, 'HH:mm').toISOString()
          : undefined,
        delay: bus.delay,
        run: bus.run === '運休' ? false : true,
        license_number: bus.license_number,
        location: {
          lat: bus.lat,
          lon: bus.lon
        },
        stops: {
          first: {
            id: stops[0].id,
            name: stops[0].name,
            time: stops[0].time
          },
          passing,
          next,
          last: {
            id: stops[stops.length - 1].id,
            name: stops[stops.length - 1].name,
            time: stops[stops.length - 1].time
          }
        }
      })
    }
  }

  return {
    change,
    buses,
    time: { latest: cache.time.latest, diff: cache.time.diff },
    raw: res.text
  }
}
