import { Router } from 'express'
import * as createHttpError from 'http-errors'

import { getStops } from '../../../libs/gtfs/static'
import { stopToBroadcastStop } from '../../../libs/gtfs/util'

import timetable from './timetable'

const router = Router({ mergeParams: true })

router.use('/:id/timetable', timetable)

// 停留所一覧
router.get('/', async (req, res, next) =>
  getStops()
    .then(async stops =>
      req.params.companyName in stops
        ? res.json(
            req.query.details === 'true'
              ? await Promise.all(
                  Object.values(stops[req.params.companyName]).map(
                    async stop => await stopToBroadcastStop(req.params.companyName, stop)
                  )
                )
              : Object.keys(stops[req.params.companyName])
          )
        : next(createHttpError(404, 'There is no such company.'))
    )
    .catch(next)
)

// 停留所情報
router.get('/:id', async (req, res, next) =>
  getStops()
    .then(async stops =>
      stops[req.params.companyName][req.params.id]
        ? res.json(
            await stopToBroadcastStop(
              req.params.companyName,
              stops[req.params.companyName][req.params.id]
            )
          )
        : next(createHttpError(404, 'There is no such bus stop.'))
    )
    .catch(next)
)

export default router
