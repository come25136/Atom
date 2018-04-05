import * as superagent from 'superagent'

import * as _moment from 'moment'
import { extendMoment } from 'moment-range'

import route from './libs/route'
import { default as stops, Istop } from './libs//gtfs_loader/stops'

import { rawToObject, basumada } from './libs/basumada'

import { getDistance } from 'geolib'

import { writeFile } from 'fs'

import { Server as httpServer } from 'http'
import * as express from 'express'

import * as socketIo from 'socket.io'

import { createBusToBroadcastObject } from './libs/util'

import { broadcastData } from './interfaces'

const moment = extendMoment(_moment),
  app = express(),
  port = process.env.PORT || 3000,
  server = new httpServer(app),
  io = socketIo(server)

app.disable('x-powered-by')

const times: number[] = [6000]

const cache: {
  date: {
    diff?: number
  }
  data: {
    raw?: string
    buses?: broadcastData[]
    createBuses?: basumada['buses']
  }
} = {
  date: {
    diff: undefined
  },
  data: {
    raw: undefined,
    buses: undefined,
    createBuses: undefined
  }
}

async function getBusLoop() {
  if (
    moment
      .range(moment('1:30', 'H:mm'), moment('6:30', 'H:mm'))
      .contains(moment())
  )
    return setTimeout(getBusLoop, moment('6:30', 'H:mm').diff(moment()))

  try {
    const { change, buses, date, raw } = await rawToObject(
      await superagent
        .get('http://www3.unobus.co.jp/GPS/unobus.txt')
        .then(res => res.text),
      cache.data.raw
    )

    cache.data.raw = raw

    if (10 < times.length) times.shift()
    // if (time.diff) times.push(0 <= time.diff ? time.diff : 3000)

    if (
      // times.length === 1 ||
      Object.keys(buses).length === 0
    )
      return setTimeout(getBusLoop, times[0])

    if (change) {
      if (process.env.RAW_SAVE === 'true')
        writeFile(
          `./raw_data/${date.format('YYYY-MM-DD HH-mm-ss')}.txt`,
          raw,
          err => (err ? console.log(err) : null)
        )

      console.log('change!!')

      cache.data.buses = await Promise.all(
        Object.values(buses).map(bus => createBusToBroadcastObject(bus))
      )

      /*
      {
        run: bus.isRun,
        license_number: bus.getLicenseNumber,
        delay: bus.getDelay,
        route_num: bus.getRouteNumber,
        direction: await direction(
          bus.getStops.passing.id ? bus.getStops.passing.id : '',
          bus.getStops.next.id ? bus.getStops.next.id : '',
          bus.getLocation
        ),
        okayama_station: {
          pass: bus.getOkayamaStation.pass,
          time: bus.getOkayamaStation.time
            ? bus.getOkayamaStation.time.format()
            : undefined
        },
        location: bus.getLocation,
        stops: bus.getStops
      }
      */

      io.emit('unobus', buses)
    }

    const awaitTime = date
      .clone()
      .add(times.reduce((prev, current) => prev + current) / times.length, 'ms')
      .diff(moment())

    console.log(
      `It gets the data after ${(0 < awaitTime ? awaitTime : 3000) /
        1000} seconds.`
    )

    setTimeout(getBusLoop, 0 < awaitTime ? awaitTime : 3000)
  } catch (err) {
    console.log(err)
    setTimeout(getBusLoop, 1000)
  }
}
/*
io.on(
  'connection',
  () => (busesCache ? io.emit('unobus', [...busesCache.values()]) : null)
)
*/
getBusLoop()

// 停留所を取得
app.get('/stops', (req, res) =>
  stops.then(stops => res.json(stops)).catch(err => res.status(500).end())
)

// 系統番号と時刻から時刻表を取得
app.get('/:companyName/route/:routeNum/:date', (req, res) =>
  route(req.params.routeNum, req.params.date)
    .then(stops => res.json(stops))
    .catch(err => res.status(404).json({ error: { message: err.message } }))
)

//httpサーバー起動
server.listen(port, () =>
  console.log(`UnoBus API wrap WebSocket server | port: ${port}`)
)
