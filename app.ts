import * as config from 'config'
import * as cors from 'cors'
import * as env from 'env-var'
import * as express from 'express'
import { NextFunction, Request, Response } from 'express-serve-static-core'
import { Server as httpServer } from 'http'
import * as _ from 'lodash'
import * as socketIo from 'socket.io'
import * as swaggerJSDoc from 'swagger-jsdoc'
import * as swaggerUi from 'swagger-ui-express'
import { createConnection } from 'typeorm'

import { Remote } from './db/entitys/gtfs/remote'
import { dataUpdatedCallback, LoopGetRealtimeData } from './libs/get_data/loop_get_data'
import logger from './libs/logger'
import { millisecondsUntilNextTime, toEmitData } from './libs/util'
import wwwRoot from './routes'
import { importGtfsToDb } from './stores'

interface Config {
  remotes: {
    [id: string]: {
      static: {
        url: string
      }
      realtime: {
        trip_update: {
          url: string
        }
        vehicle_position: {
          url: string
        }
        alert: {
          url: string
        }
      }
    }
  }
}

const app = express()
const port = env.get('PORT', '3000').asPortNumber()
const server = new httpServer(app)
const io = socketIo(server)

app.disable('x-powered-by')

app.use(express.static(`${__dirname}/../static`))

app.get(
  /^\/(swagger.+)?$/,
  swaggerUi.serve,
  swaggerUi.setup(
    swaggerJSDoc({
      swaggerDefinition: {
        info: {
          version: '2.0.0',
          title: 'Atom System',
          description:
            'Atomは進化し、高速なレスポンスを提供する力を手に入れた\n\n個人開発に高望みしないで'
        },
        basePath: '/v2'
      },
      apis: ['routes/**/*.ts']
    }),
    {
      customCssUrl:
        'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-muted.css'
    }
  )
)

app.use(cors())
app.use(express.json())

app.use('/', wwwRoot)

app.use((req: Request, res: Response): any => res.status(404).end())

app.use((err: any, req: Request, res: Response, next: NextFunction): any => {
  if (err.isJoi)
    return res.status(400).json({
      error: err.details.map(detail => ({ message: detail.message }))
    })

  if (err.statusCode === undefined || err.statusCode === 500) {
    logger.error(err.stack)

    return res.status(500).end()
  }

  res.status(404).json({
    error: [
      {
        message: err.message || null
      }
    ]
  })
})

if (env.get('NODE_ENV', 'development').asString() !== 'test') {
  createConnection().then(async () => {
    if (env.get('GTFS_TO_DB', 'false').asBoolStrict()) {
      const configRemoteIds: string[] = Object.keys(config.get<Remote>('remotes'))

      async function LoopimportGtfs() {
        for (const id of configRemoteIds) {
          await importGtfsToDb(id).catch(logger.error)
        }

        setTimeout(LoopimportGtfs, millisecondsUntilNextTime('03:15:00'))
      }

      await LoopimportGtfs()
    }

    if (env.get('REALTIME', 'true').asBoolStrict()) {
      const dataUpdatedCallback: dataUpdatedCallback = (remote, broadcastVehicles) =>
        io.to(remote.id).emit('vehicle', toEmitData(remote.id, broadcastVehicles))

      const loops: LoopGetRealtimeData[] = _.compact(
        await Promise.all(
          Object.entries(config.get<Config['remotes']>('remotes'))
            .filter(([, conf]) => 'realtime' in conf)
            .map(async ([id]) => {
              const remote = await Remote.findOne({ id })

              if (remote === undefined) return

              return new LoopGetRealtimeData(remote, dataUpdatedCallback)
            })
        )
      )

      io.on('connection', socket => {
        socket.on('subscribe', (remoteId: string) => {
          const loop = loops.find(loop => loop.remote.id === remoteId)

          loop === undefined
            ? socket.emit('subscribe', {
              success: false,
              error: { code: 404 },
              company_name: remoteId
            })
            : socket.join(remoteId, () => {
              socket.emit('subscribe', {
                success: true
              })
              socket.emit('vehicle', toEmitData(loop.remote.id, loop.broadcastVehicles))
            })
        })

        socket.on('unsubscribe', (remoteId: string) => {
          const loop = loops.find(loop => loop.remote.id === remoteId)

          loop === undefined
            ? socket.emit('unsubscribe', {
              success: false,
              error: { code: 404 },
              company_name: remoteId
            })
            : socket.leave(remoteId, () =>
              socket.emit('unsubscribe', {
                success: true
              })
            )
        })
      })
    }

    server.listen(port, () => logger.info(`Listen port ${port}.`))
  })
}

export default app
