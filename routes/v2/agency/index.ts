import { Router } from 'express'

import { Agency } from '../../../db/entitys/gtfs/agency'
import { objSnakeCase } from '../../../libs/util'

const router = Router({ mergeParams: true })

/**
 * @swagger
 * /{remoteID}/agency:
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
