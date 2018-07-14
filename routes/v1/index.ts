import { Router } from 'express'

import stops from './stops'
import route from './route'

const router = Router({ mergeParams: true })

router.use('/stops', stops)
router.use('/route', route)

export default router
