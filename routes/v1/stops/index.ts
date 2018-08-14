import { Router } from 'express'

import schedule from './schedule'

import { stopToBroadcastStop } from '../../../libs/util'

import stops from '../../../libs/gtfs_loader/stops'

const router = Router({ mergeParams: true })

router.use('/:id/schedule', schedule)

// 停留所一覧
router.get('/', (req, res) =>
  stops()
    .then(async stops =>
      res.json(
        req.query.details === 'true'
          ? await Promise.all(
              Object.values(stops[req.params.companyName]).map(
                async stop => await stopToBroadcastStop(req.params.companyName, stop)
              )
            )
          : Object.keys(stops[req.params.companyName])
      )
    )
    .catch(err => res.status(404).json({ error: { message: 'There is no such bus company.' } }))
)

// 停留所情報
router.get('/:id', (req, res) =>
  stops()
    .then(
      async stops =>
        stops[req.params.companyName][req.params.id]
          ? res.json(
              await stopToBroadcastStop(
                req.params.companyName,
                stops[req.params.companyName][req.params.id]
              )
            )
          : res.status(404).json({ error: { message: 'There is no such bus stop.' } })
    )
    .catch(err => {
      res.status(500).end()
      throw err
    })
)

export default router
