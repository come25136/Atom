import { Router } from 'express'
import * as createHttpError from 'http-errors'

import { getAgency } from '../../libs/gtfs/static'

import route from './routes'
import stops from './stops'
import vehicles from './vehicles'

const router = Router({ mergeParams: true })

router.use('/stops', stops)
router.use('/routes', route)
router.use('/vehicles', vehicles)

router.get('/', async (req, res, next) =>
  getAgency()
    .then(agencys =>
      res.json(
        agencys[req.params.companyName].map(agency => ({
          id: agency.agency_id,
          name: agency.agency_name,
          url: agency.agency_url,
          timezone: agency.agency_timezone,
          lang: agency.agency_lang,
          phone: agency.agency_phone,
          fare_url: agency.agency_fare_url,
          email: agency.agency_email
        }))
      )
    )
    .catch(() => next(createHttpError(404, 'There is no such company.')))
)

export default router
