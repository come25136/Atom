import * as cors from 'cors'
import * as express from 'express'
import { NextFunction, Request, Response } from 'express-serve-static-core'
import { Server as httpServer } from 'http'
import * as socketIo from 'socket.io'

import { dataUpdatedCallback, LoopGetData } from './libs/get_data/loop_get_data'
import { LoopOkadenBus } from './libs/get_data/okadenbus'
import { LoopRyobiBus } from './libs/get_data/ryobibus'
import { LoopUnoBus } from './libs/get_data/unobus'
import { ioEmitBus } from './libs/util'
import wwwRoot from './routes'

const app = express()
const port = process.env.PORT || 3000
const server = new httpServer(app)
const io = socketIo(server)

app.disable('x-powered-by')

app.use(cors())

app.use('/', wwwRoot)

app.use('/', express.static(`${__dirname}/../static`, { index: 'api.html' })) // distからの相対パス

app.use((req: Request, res: Response): any => res.status(404).end())

app.use(
  (err: any, req: Request, res: Response, next: NextFunction): any => {
    process.stdout.write(req.originalUrl, err.message)

    if (err.statusCode === undefined || err.statusCode === 500) {
      console.error(err.message)

      return res.status(500).end()
    }

    res.status(404).json({
      error: {
        message: err.message || null
      }
    })
  }
)

if (process.env.NODE_ENV !== 'test') {
  const dataUpdatedCallback: dataUpdatedCallback = (loopName, broadcastVehicles) =>
    ioEmitBus(io, loopName, broadcastVehicles)

  const loops: LoopGetData[] = [
    new LoopUnoBus(dataUpdatedCallback),
    new LoopRyobiBus(dataUpdatedCallback),
    new LoopOkadenBus(dataUpdatedCallback)
  ]

  io.on('connection', socket => {
    socket.on('registration', (companyName: string) => {
      const loop = loops.find(({ name }) => name === companyName)

      loop === undefined
        ? socket.emit('registration', {
            success: false,
            error: { code: 404 },
            company_name: companyName
          })
        : socket.join(companyName, () => {
            socket.emit('registration', {
              success: true
            })
            ioEmitBus(io, loop.name, loop.broadcastVehicles)
          })
    })

    socket.on('unregistration', (companyName: string) => {
      const loop = loops.find(({ name }) => name === companyName)

      loop === undefined
        ? socket.emit('unregistration', {
            success: false,
            error: { code: 404 },
            company_name: companyName
          })
        : socket.leave(companyName, () => socket.emit('unregistration', { success: true }))
    })
  })

  // httpサーバー起動
  server.listen(port, () => process.stdout.write(`Bus API server | port: ${port}`))

  let ctrlCPushFlag: boolean = false

  //  Ctrl-C
  process.on('SIGINT', () => {
    if (ctrlCPushFlag) process.exit()

    ctrlCPushFlag = true
    process.stdout.write('Waiting for all connections to be disconnected...')

    server.close(() => process.exit())
  })
}

export default app
