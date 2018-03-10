import { Server as httpServer } from 'http'
import * as express from 'express'

import * as socketIo from 'socket.io'

import { getDistance } from 'geolib'

import * as _moment from 'moment'
import { extendMoment } from 'moment-range'

import route from './libs/route'

import { Ibus } from './interfaces'

import * as unobus from './libs/unobus'

process.chdir(process.argv[2] === 'true' ? process.cwd() : './')

const
  moment = extendMoment(_moment),
  app = express(),
  port = process.env.PORT || 3000,
  server = new httpServer(app),
  io = socketIo(server)

app.disable('x-powered-by')

interface Icache {
  time: _moment.Moment
  data: string
}

const times: number[] = [6000]

let busesCache: Map<number, Ibus>

const accessTime = moment.range(moment('1:30', 'H:mm'), moment('6:30', 'H:mm'))

async function getBusLoop() {
  if (accessTime.contains(moment())) return setTimeout(getBusLoop, moment('6:30', 'H:mm').diff(moment()))

  try {
    const { change, buses, time } = await unobus.get()

    if (100 < times.length) times.shift()
    if (time.diff) times.push(time.diff)

    if (times.length === 1 || buses.size === 0 || (busesCache && busesCache.size === 0 && buses.size === 0)) return setTimeout(getBusLoop, times[0])

    if (change) {
      // writeFile(`./raw_data/${time.latest.format('YYYY-MM-DD HH-mm-ss')}.txt`, raw, err => err ? console.log(err) : null)

      if (busesCache && busesCache.values().next().value.license_number === buses.values().next().value.license_number) {
        console.log('\nmoved!!')
        console.log(`[${String(buses.values().next().value.license_number).substr(0, 2)}-${String(buses.values().next().value.license_number).substr(2, 2)}]`)
        console.log(times[times.length - 1] / 1000 + 's')

        const distance = getDistance(
          { latitude: busesCache.values().next().value.location.lat, longitude: busesCache.values().next().value.location.lon },
          { latitude: buses.values().next().value.location.lat, longitude: buses.values().next().value.location.lon }
        )

        console.log(distance + 'm')
        console.log(distance === 0 ? '0km/h\n' : (distance / 1000 / (times[times.length - 1] / 1000) * 3600).toFixed(5) + 'km/h\n')
      }

      busesCache = buses

      io.emit('unobus', [...buses.values()])
    }

    const awaitTime = time.latest.add(times.reduce((prev, current) => prev + current) / times.length, 'ms').diff(moment())

    console.log(`It gets the data after ${(awaitTime <= 0 ? 3000 : awaitTime) / 1000} seconds`)

    setTimeout(getBusLoop, awaitTime <= 0 ? 3000 : awaitTime)
  } catch (err) {
    console.log(err)
    setTimeout(getBusLoop, 1000)
  }
}

io.on('connection', () => busesCache ? io.emit('unobus', [...busesCache.values()]) : null)

getBusLoop()

// 系統番号と時刻から時刻表を取得
app.get('/route/:lineNum/:date', (req, res) => route(req.params.lineNum, req.params.date).then(stops => res.json(stops)))

//httpサーバー起動
server.listen(port, () => console.log(`UnoBus API wrap WebSocket server | port: ${port}`))
