import { Router } from 'express'
import * as createHttpError from 'http-errors'

import { getAgency } from '../../libs/gtfs/static'

import route from './routes'
import stops from './stops'

const router = Router({ mergeParams: true })

router.use('/stops', stops)
router.use('/routes', route)

router.get('/', async (req, res, next) =>
  getAgency()
    .then(agency =>
      res.json({
        id: agency[req.params.companyName].agency_id,
        name: agency[req.params.companyName].agency_name,
        url: agency[req.params.companyName].agency_url,
        timezone: agency[req.params.companyName].agency_timezone,
        lang: agency[req.params.companyName].agency_lang,
        phone: agency[req.params.companyName].agency_phone,
        fare_url: agency[req.params.companyName].agency_fare_url,
        email: agency[req.params.companyName].agency_email
      })
    )
    .catch(() => next(createHttpError(404, 'There is no such company.')))
)

export default router
