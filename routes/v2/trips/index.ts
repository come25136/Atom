import { Router } from 'express'
import * as createHttpError from 'http-errors'
import moment = require('moment')
import { getManager } from 'typeorm'

import { Shape } from '../../../db/entitys/gtfs/shape'
import { Trip } from '../../../db/entitys/gtfs/trip'
import joi from '../../../libs/joi'
import { objSnakeCase } from '../../../libs/util'

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
 *   trip:
 *     type: object
 *     properties:
 *       route_id:
 *         type: string
 *       service_id:
 *         type: string
 *       id:
 *         type: string
 *       headsign:
 *         type: string
 *         nullable: true
 *       short_name:
 *         type: string
 *         nullable: true
 *       direction_id:
 *         type: string
 *         nullable: true
 *       block_id:
 *         type: string
 *         nullable: true
 *       shape_id:
 *         type: string
 *         nullable: true
 *       wheelchair_sccessible:
 *         type: number
 *         enum: [0, 1, 2]
 *         nullable: true
 *       bikes_sllowed:
 *         type: number
 *         enum: [0, 1, 2]
 *         nullable: true
 *
 * /{remoteID}/trips?details=true:
 *   get:
 *     summary: Trips
 *     description: https://developers.google.com/transit/gtfs/reference#tripstxt
 *     tags:
 *       - Trip
 *     parameters:
 *       - $ref: '#/parameters/remoteID'
 *     responses:
 *       200:
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/trip'
*/
router.get('/', (req, res, next) => {
  const queryVR = rootQuerySchema.validate(req.query, {
    abortEarly: false
  })
  if (queryVR.error) return next(queryVR.error)

  Trip.find({ remote: res.middlelocals.remote })
    .then(trips => {
      if (queryVR.value.details === false) return res.json(trips.map(({ id }) => id))

      return res.json(trips.map(trip => objSnakeCase(trip.public)))
    })
    .catch(next)
})

router.use('/:id', async (req, res, next) =>
  Trip.findOne({ remote: res.middlelocals.remote, id: req.params.id })
    .then(trip => {
      if (trip === undefined) throw createHttpError(404, 'There\'s no trip.')

      res.locals.trip = trip

      next()
    })
    .catch(next)
)

/**
 * @swagger
 *
 * parameter:
 *   tripID:
 *     in: path
 *     name: tripID
 *     required: true
 *     type: string
 *
 * /{remoteID}/trips/{tripID}?details=true:
 *   get:
 *     summary: Trip
 *     description: https://developers.google.com/transit/gtfs/reference#tripstxt
 *     tags:
 *       - Trip
 *     parameters:
 *       - $ref: '#/parameters/remoteID'
 *       - $ref: '#/parameters/tripID'
 *     responses:
 *       200:
 *         schema:
 *           $ref: '#/definitions/trip'
*/
router.get('/:id', async (req, res, next) =>
  Trip.findOne({ remote: res.middlelocals.remote, id: res.locals.trip.id })
    .then(trip => {
      if (trip === undefined) throw createHttpError(404, 'There\'s no trip.')

      return res.json(objSnakeCase(trip.public))
    })
    .catch(next)
)

/**
 * @swagger
 *
 * /{remoteID}/trips/{tripID}/geojson:
 *   get:
 *     description: https://developers.google.com/transit/gtfs/reference#shapestxt
 *     tags:
 *       - Trip
 *     parameters:
 *       - $ref: '#/parameters/remoteID'
 *       - $ref: '#/parameters/tripID'
 *     responses:
 *       200:
 *         schema:
 *           $ref: '#/definitions/geojson'
*/
router.get('/:id/geojson', async (req, res, next) =>
  Shape.geoJson(res.middlelocals.remote.uid, { tripId: res.locals.trip.id })
    .then(shapes => res.json(shapes))
    .catch(next)
)

const routeId_route_dateParamSchema = joi
  .object()
  .keys({
    date: joi.date()
  })
  .unknown()
const tripId_QuerySchema = joi
  .object()
  .keys({
    details: joi.boolean().default(false)
  })
  .unknown()


/**
 * @swagger
 *
 * /{remoteID}/trips/{tripID}/route/{date}:
 *   get:
 *     description: https://developers.google.com/transit/gtfs/reference#shapestxt
 *     tags:
 *       - Trip
 *     parameters:
 *       - $ref: '#/parameters/remoteID'
 *       - $ref: '#/parameters/tripID'
 *       - $ref: '#/parameters/date'
 *     responses:
 *       200:
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/route/date'
*/
router.get('/:id/route/:date', (req, res, next) => {
  const paramVR = routeId_route_dateParamSchema.validate(req.params, {
    abortEarly: false
  })
  if (paramVR.error) return next(paramVR.error)

  const queryVR = tripId_QuerySchema.validate(req.query, {
    abortEarly: false
  })
  if (queryVR.error) return next(queryVR.error)

  getManager()
    .transaction(async trn =>
      Trip.findRoutes(
        res.middlelocals.remote.uid,
        {
          tripId: res.locals.trip.id,
          standardDate: moment(paramVR.value.date, 'YYYY-MM-DD').tz(res.middlelocals.timezone)
        },
        trn
      )
    )
    .then(([route]) => {
      if (route === undefined) throw createHttpError(404, 'There\'s no trip.')

      const resData = route.calcStops.map(stop =>
        queryVR.value.details
          ? objSnakeCase({
            ...stop,
            date: {
              arrival: {
                schedule: stop.date.arrival.schedule.tz(res.middlelocals.timezone).format()
              },
              departure: {
                schedule: stop.date.departure.schedule.tz(res.middlelocals.timezone).format()
              }
            }
          })
          : stop.id
      )

      res.json(resData)
    })
    .catch(next)
})

export default router
