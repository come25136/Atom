import * as cors from 'cors'
import * as express from 'express'
import { NextFunction, Request, Response } from 'express-serve-static-core'
import { Server as httpServer } from 'http'
import * as socketIo from 'socket.io'

import { RyobiBusLoop } from './libs/get_data/ryobibus'
import { UnoBusLoop } from './libs/get_data/unobus'
import { ioEmitBus } from './libs/util'
import wwwRoot from './routes'

const app = express()
const port = process.env.PORT || 3000
const server = new httpServer(app)
const io = socketIo(server)

app.disable('x-powered-by')

app.use(cors())

app.use('/', wwwRoot)

app.use((req: Request, res: Response, next: NextFunction): any => res.status(404).end())

app.use(
  (err: any, req: Request, res: Response, next: NextFunction): any => {
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
  const loops = [new UnoBusLoop(io), new RyobiBusLoop(io)]

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
            ioEmitBus(io, loop.name, loop.buses)
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
  server.listen(port, () => console.log(`Bus API server | port: ${port}`))
}

export default app
