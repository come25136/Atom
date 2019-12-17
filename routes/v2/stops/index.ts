import { Router } from 'express'
import * as createHttpError from 'http-errors'
import * as _ from 'lodash'

import { Stop } from '../../../db/entitys/gtfs/stop'
import joi from '../../../libs/joi'
import { objSnakeCase } from '../../../libs/util'
import timetable from './timetable'

const router = Router({ mergeParams: true })

const rootQuerySchema = joi
  .object()
  .keys({
    details: joi.boolean().default(false)
  })
  .unknown()

/**
 * @swagger
 *
 * definitions:
 *   stop:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *       code:
 *         type: string
 *         nullable: true
 *       name:
 *         type: string
 *         nullable: true
 *       description:
 *         type: string
 *         nullable: true
 *       location:
 *         type: object
 *         properties:
 *           type:
 *             type: number
 *             enum: [0, 1, 2]
 *             nullable: true
 *           lat:
 *             type: number
 *             nullable: true
 *           lon:
 *             type: number
 *             nullable: true
 *       zone:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *             nullable: true
 *       url:
 *         type: string
 *         nullable: true
 *       parent_station:
 *         type: string
 *         nullable: true
 *       timezone:
 *         type: string
 *         nullable: true
 *       wheelchair_boarding:
 *         type: number
 *         enum: [0, 1, 2]
 *         nullable: true
 *       level:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *             nullable: true
 *       platform_code:
 *         type: string
 *         nullable: true
 *
 * /{remoteID}/stops?details=true:
 *   get:
 *     summary: Stops
 *     description: https://developers.google.com/transit/gtfs/reference#stopstxt
 *     tags:
 *       - Stop
 *     parameters:
 *       - $ref: '#/parameters/remoteID'
 *     responses:
 *       200:
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/stop'
*/
router.get('/', (req, res, next) => {
  const queryVR = rootQuerySchema.validate(req.query, {
    abortEarly: false
  })
  if (queryVR.error) return next(queryVR.error)

  Stop.find({ remote: res.middlelocals.remote })
    .then(stops => {
      if (queryVR.value.details === false) return res.json(stops.map(({ id }) => id))

      return res.json(stops.map(stop => objSnakeCase(stop.public)))
    })
    .catch(next)
})

router.use('/:id', async (req, res, next) =>
  Stop.findOne({ remote: res.middlelocals.remote, id: req.params.id })
    .then(stop => {
      if (stop === undefined) throw createHttpError(404, 'There\'s no stop.')

      res.locals.stop = stop

      next()
    })
    .catch(next)
)

/**
 * @swagger
 *
 * parameter:
 *   stopID:
 *     in: path
 *     name: stopID
 *     required: true
 *     type: string
 *
 * /{remoteID}/stops/{stopID}:
 *   get:
 *     summary: Stop
 *     description: https://developers.google.com/transit/gtfs/reference#stopstxt
 *     tags:
 *       - Stop
 *     parameters:
 *       - $ref: '#/parameters/remoteID'
 *       - $ref: '#/parameters/stopID'
 *     responses:
 *       200:
 *         schema:
 *           $ref: '#/definitions/stop'
*/
router.get('/:id', (req, res, next) => res.json(objSnakeCase(res.locals.stop.public)))

router.use('/:id/timetable', timetable)

export default router
