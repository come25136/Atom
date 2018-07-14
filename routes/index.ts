import { Router } from 'express'

import v1 from './v1'

import stops from '../libs/gtfs_loader/stops'

const router = Router({ mergeParams: true })

// バス会社一覧
router.get('/v1', (req, res) => stops().then(stops => res.json(Object.keys(stops))))

router.use('/v1/:companyName', v1)

export default router
