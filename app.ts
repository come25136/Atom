import * as superagent from 'superagent'

import * as _moment from 'moment'
import { extendMoment } from 'moment-range'

import { rawToObject } from './libs/basumada'

import { writeFile } from 'fs'

import { Server as httpServer } from 'http'
import * as express from 'express'

import * as cors from 'cors'

import * as socketIo from 'socket.io'

import { createBusToBroadcastObject } from './libs/util'

import { broadcastData } from './interfaces'

import wwwRoot from './routes'

const moment = extendMoment(_moment),
  app = express(),
  port = process.env.PORT || 3000,
  server = new httpServer(app),
  io = socketIo(server)

app.disable('x-powered-by')

app.use(cors())

app.use('/', wwwRoot)

const changeTimes: number[] = []

const cache: {
  date?: _moment.Moment
  data: {
    raw: string
    broadcastBuses: broadcastData[]
  }
} = {
  date: undefined,
  data: {
    raw: '',
    broadcastBuses: []
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

    cache.data.raw = raw

    if (Object.keys(buses).length === 0) return setTimeout(getBusLoop, 6000)

    // 起動直後は必ずtrueになる
    if (change) {
      changeTimes.push(cache.date ? moment().diff(cache.date) : 13000)
      if (10 < changeTimes.length) changeTimes.shift()

      cache.date = date

      if (process.env.RAW_SAVE === 'true')
        writeFile(`./raw_data/${date.format('YYYY-MM-DD HH-mm-ss')}.txt`, raw, err => (err ? console.log(err) : null))

      console.log('change!!')

      cache.data.broadcastBuses = await Promise.all(Object.values(buses).map(bus => createBusToBroadcastObject(bus)))

      io.emit('unobus', cache.data.broadcastBuses)
    }

    const awaitTime = cache.date
      ? cache.date
          .clone()
          .add(changeTimes.reduce((prev, current) => prev + current) / changeTimes.length, 'ms')
          .diff(moment())
      : 6000 // falseになることはないけど一応バグった時用に

    const awaitTime2 = 0 < awaitTime && awaitTime <= 10000 ? awaitTime : 3000 // システムの都合上10秒以上待つとリアルタイム性が失われるので

    console.log(`It gets the data after ${awaitTime2 / 1000} seconds. ${awaitTime}`)

    setTimeout(getBusLoop, awaitTime2)
  } catch (err) {
    console.log(err)
    setTimeout(getBusLoop, 1000)
  }
}

io.on('connection', socket => (cache.data.broadcastBuses ? socket.emit('unobus', cache.data.broadcastBuses) : null))

getBusLoop()

//httpサーバー起動
server.listen(port, () => console.log(`UnoBus API wrap WebSocket server | port: ${port}`))
