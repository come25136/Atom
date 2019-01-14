import { Router } from 'express'

import { getStops } from '../libs/gtfs/static'

import v1 from './v1'

const router = Router({ mergeParams: true })

router.use('/v1/:companyName', v1)

// バス会社一覧
router.get('/v1', async (req, res) => getStops().then(stops => res.json(Object.keys(stops))))

export default router
