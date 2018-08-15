import * as moment from 'moment'

import { Router } from 'express'

import { route, getGeo } from '../../../libs/route'

const router = Router({ mergeParams: true })

router.get('/:routeNum', (req, res) =>
  getGeo(req.params.companyName, req.params.routeNum)
    .then(shapes => res.json(shapes))
    .catch(err => res.status(404).json({ error: { message: err.message } }))
)

// 系統番号と時刻から時刻表を取得
router.get('/:routeNum/:date', (req, res) =>
  route(req.params.companyName, req.params.routeNum, moment(req.params.date), true)
    .then(stops =>
      res.json(req.query.details === 'true' ? stops : stops.map(trip => trip.map(stop => stop.id)))
    )
    .catch(err => res.status(404).json({ error: { message: err.message } }))
)

export default router
