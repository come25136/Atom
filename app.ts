import * as superagent from 'superagent'

import * as _moment from 'moment'
import { extendMoment } from 'moment-range'

import route from './libs/route'
import { default as stops } from './libs//gtfs_loader/stops'

import { rawToObject, basumada } from './libs/basumada'

import { getDistance } from 'geolib'

import { writeFile } from 'fs'

import { Server as httpServer } from 'http'
import * as express from 'express'

import * as cors from 'cors'

import * as socketIo from 'socket.io'

import { createBusToBroadcastObject } from './libs/util'

import { broadcastData } from './interfaces'

const moment = extendMoment(_moment),
  app = express(),
  port = process.env.PORT || 3000,
  server = new httpServer(app),
  io = socketIo(server)

app.disable('x-powered-by')

app.use(cors())

const times: number[] = [6000]

const cache: {
  date?: _moment.Moment
  data: {
    raw?: string
    buses?: broadcastData[]
    createBuses?: basumada['buses']
  }
} = {
  date: undefined,
  data: {
    raw: undefined,
    buses: undefined,
    createBuses: undefined
  }
}

async function getBusLoop() {
  if (moment.range(moment('1:30', 'H:mm'), moment('6:30', 'H:mm')).contains(moment()))
    return setTimeout(getBusLoop, moment('6:30', 'H:mm').diff(moment()))

  try {
    const { change, buses, date, raw } = await rawToObject(
      'unobus',
      await superagent.get('http://www3.unobus.co.jp/GPS/unobus.txt').then(res => res.text),
      cache.data.raw
    )

    const diff = cache.date ? date.diff(cache.date) : 6000

    cache.date = date
    cache.data.raw = raw

    times.push(0 <= diff ? diff : 3000)
    if (10 < times.length) times.shift()

    if (Object.keys(buses).length === 0) return setTimeout(getBusLoop, times[0])

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

      io.emit('unobus', cache.data.buses)
    }

    let awaitTime = date
      .clone()
      .add(times.reduce((prev, current) => prev + current) / times.length, 'ms')
      .diff(moment())
    awaitTime = 0 < awaitTime && awaitTime <= 60000 ? awaitTime : 3000 // 1分以上待つのはありえないので

    console.log(`It gets the data after ${awaitTime / 1000} seconds.`)

    setTimeout(getBusLoop, awaitTime)
  } catch (err) {
    console.log(err)
    setTimeout(getBusLoop, 1000)
  }
}

io.on('connection', socket => (cache.data.buses ? socket.emit('unobus', cache.data.buses) : null))

getBusLoop()

// 停留所を取得
app.get('/:companyName/stops', (req, res) =>
  stops()
    .then(stops => res.json(stops[req.params.companyName]))
    .catch(err => res.status(500).end())
)

app.get('/:companyName/stops/:id', (req, res) =>
  stops()
    .then(
      stops =>
        stops[req.params.companyName][req.params.id]
          ? res.json(stops[req.params.companyName][req.params.id])
          : res.status(404).json({ error: { message: 'There is no such bus stop.' } })
    )
    .catch(err => res.status(500).end())
)

// 系統番号と時刻から時刻表を取得
app.get('/:companyName/route/:routeNum/:date', (req, res) =>
  route(req.params.companyName, req.params.routeNum, req.params.date)
    .then(stops => res.json(stops))
    .catch(err => res.status(404).json({ error: { message: err.message } }))
)

//httpサーバー起動
server.listen(port, () => console.log(`UnoBus API wrap WebSocket server | port: ${port}`))
