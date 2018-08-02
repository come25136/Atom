import * as superagent from 'superagent'

import * as _moment from 'moment'
import { extendMoment } from 'moment-range'

import { writeFile } from 'fs'

import { rawToObject } from '../basumada'
import { createBusToBroadcastObject } from '../util'

import { broadcastData } from '../../interfaces'

import { Server } from 'socket.io'

const moment = extendMoment(_moment)

const changeTimes: number[] = []

const cache: {
  date?: _moment.Moment
  data: {
    raw: string
    broadcastBuses: {
      positions: broadcastData[]
    }
  }
} = {
  date: undefined,
  data: {
    raw: '',
    broadcastBuses: {
      positions: []
    }
  }
}

export function unoBusLoop(io: Server, companyName: string) {
  async function getBusLoop() {
    if (moment.range(moment('1:30', 'H:mm'), moment('6:30', 'H:mm')).contains(moment()))
      return setTimeout(getBusLoop, moment('6:30', 'H:mm').diff(moment()))

    try {
      const { change, buses, date, raw } = await rawToObject(
        'unobus',
        (await superagent.get('http://www3.unobus.co.jp/GPS/unobus.txt')).text,
        cache.data.raw
      )

      cache.data.raw = raw

      if (Object.keys(cache.data.broadcastBuses).length !== 0 && Object.keys(buses).length === 0)
        io.to(companyName).emit('position', {
          company_name: companyName,
          buses: (cache.data.broadcastBuses.positions = [])
        })
      if (Object.keys(buses).length === 0) return setTimeout(getBusLoop, 6000)

      // 起動直後は必ずtrueになる
      if (change) {
        changeTimes.push(cache.date ? moment().diff(cache.date) : 13000)
        if (10 < changeTimes.length) changeTimes.shift()

        cache.date = date

        if (process.env.RAW_SAVE === 'true')
          writeFile(
            `./raw_data/unobus/${date.format('YYYY-MM-DD HH-mm-ss')}.txt`,
            raw,
            err => (err ? console.error(err) : null)
          )

        process.env.NODE_ENV !== 'production' && console.log('change!!')

        cache.data.broadcastBuses.positions = await Promise.all(
          Object.values(buses).map(bus => createBusToBroadcastObject(bus))
        )

        io.to(companyName).emit('position', {
          company_name: companyName,
          buses: cache.data.broadcastBuses.positions
        })
      }

      const awaitTime = cache.date
        ? cache.date
            .clone()
            .add(changeTimes.reduce((prev, current) => prev + current) / changeTimes.length, 'ms')
            .diff(moment())
        : 6000 // falseになることはないけど一応バグった時用に

      const awaitTime2 = 0 < awaitTime && awaitTime <= 10000 ? awaitTime : 3000 // システムの都合上10秒以上待つとリアルタイム性が失われるので

      process.env.NODE_ENV !== 'production' &&
        console.log(`It gets the data after ${awaitTime2 / 1000} seconds. ${awaitTime}`)

      setTimeout(getBusLoop, awaitTime2)
    } catch (err) {
      console.warn(err)
      setTimeout(getBusLoop, 1000)
    }
  }

  getBusLoop()

  return {
    name: companyName,
    getPositions: () => cache.data.broadcastBuses.positions
  }
}
