import { Router } from 'express'

import stops from './stops'
import route from './routes'

import _agency from '../../libs/gtfs_loader/agency'

const router = Router({ mergeParams: true })

router.get('/', (req, res) =>
  _agency().then(agency =>
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
)

router.use('/stops', stops)
router.use('/routes', route)

export default router
