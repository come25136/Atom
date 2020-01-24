import { Router } from 'express'

import { Agency } from '../../db/entitys/gtfs/agency'
import agency from './agency'
import route from './routes'
import stops from './stops'
import translations from './translations'
import trip from './trips'

const router = Router({ mergeParams: true })

router.use('/agency', agency)
router.use('/stops', stops)
router.use('/routes', route)
router.use('/translations', translations)
router.use('/trips', trip)

/**
 * @swagger
 * /{remoteID}:
 *   get:
 *     summary: Agency
 *     description: https://developers.google.com/transit/gtfs/reference#agencytxt
 *     tags:
 *       - Agency
 *     parameters:
 *       - $ref: '#/parameters/remoteID'
 *     responses:
 *       200:
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 nullable: true
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *               timezone:
 *                 type: string
 *               lang:
 *                 type: string
 *                 nullable: true
 *               phone:
 *                 type: string
 *                 nullable: true
 *               fare_url:
 *                 type: string
 *                 nullable: true
 *               email:
 *                 type: string
 *                 nullable: true
 */
router.get('/', async (req, res, next) =>
  Agency.find({ remote: res.middlelocals.remote })
    .then(agencies => res.json(agencies.map(agency => objSnakeCase(agency.public))))
    .catch(next)
)

export default router
