import { ioEmitPosition } from './libs/util'

import { Server as httpServer } from 'http'
import * as express from 'express'

import * as cors from 'cors'

import * as socketIo from 'socket.io'

import wwwRoot from './routes'

import { unoBusLoop } from './libs/get_data/unobus'

const app = express(),
  port = process.env.PORT || 3000,
  server = new httpServer(app),
  io = socketIo(server)

app.disable('x-powered-by')

app.use(cors())

app.use('/', wwwRoot)

if (process.env.NODE_ENV !== 'test') {
  const loops = [unoBusLoop(io, 'unobus')]

  io.on('connection', socket =>
    socket.on('registration', (companyName: string) => {
      const company = loops.find(({ name }) => name === companyName)

      company === undefined
        ? socket.emit('registration_failure', {
            error: { code: 404 },
            company_name: companyName
          })
        : socket.join(companyName, () => ioEmitPosition(io, companyName, company.getPositions()))
    })
  )

  // httpサーバー起動
  server.listen(port, () => console.log(`Bus API wrap server | port: ${port}`))
}

export default app
