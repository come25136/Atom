import { Router } from 'express'
import * as moment from 'moment'

import { getGeoRoute, getRouteInfo, getRoutesStops } from '../../../libs/route'

const router = Router({ mergeParams: true })

router.get('/:routeId', async (req, res, next) =>
  getRouteInfo(req.params.companyName, req.params.routeId)
    .then(info => res.json(info))
    .catch(next)
)

router.get('/:routeId/geojson', async (req, res, next) =>
  getGeoRoute(req.params.companyName, req.params.routeId)
    .then(shapes => res.json(shapes))
    .catch(next)
)

// 系統番号と時刻から時刻表を取得
router.get('/:routeId/timetable/:date', async (req, res, next) =>
  getRoutesStops(
    req.params.companyName,
    req.params.routeId,
    moment(req.params.date),
    req.query.first_stop_time !== 'true'
  )
    .then(route =>
      res.json(req.query.details === 'true' ? route : route.map(trip => trip.map(stop => stop.id)))
    )
    .catch(next)
)

export default router
