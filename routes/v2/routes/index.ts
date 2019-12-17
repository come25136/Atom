import { Router } from 'express'
import * as createHttpError from 'http-errors'
import * as moment from 'moment-timezone'
import { getManager } from 'typeorm'

import { Route } from '../../../db/entitys/gtfs/route'
import { Shape } from '../../../db/entitys/gtfs/shape'
import { Trip } from '../../../db/entitys/gtfs/trip'
import joi from '../../../libs/joi'
import { h24ToLessH24, objSnakeCase } from '../../../libs/util'

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
 *   route:
 *     type: object
 *     properties:
 *       type:
 *         type: number
 *         enum: [0, 1, 2, 3, 4, 5, 6, 7]
 *       id:
 *         type: string
 *       name:
 *         type: object
 *         properties:
 *           short:
 *             type: string
 *           long:
 *             type: string
 *       description:
 *         type: string
 *       color:
 *         type: string
 *       text:
 *         type: object
 *         properties:
 *           color:
 *             type: string
 *
 * /{remoteID}/routes?details=true:
 *   get:
 *     summary: Routes
 *     description: https://developers.google.com/transit/gtfs/reference#routestxt
 *     tags:
 *       - Route
 *     parameters:
 *       - $ref: '#/parameters/remoteID'
 *     responses:
 *       200:
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/route'
 */
router.get('/', async (req, res, next) => {
  const queryVR = rootQuerySchema.validate(req.query, {
    abortEarly: false
  })
  if (queryVR.error) return next(queryVR.error)

  Route.find({ remote: res.middlelocals.remote })
    .then(routes => {
      if (queryVR.value.details === false) return res.json(routes.map(({ id }) => id))

      return res.json(routes.map(route => route.public))
    })
    .catch(next)
})

router.use('/:id', async (req, res, next) =>
  Route.findOne({ remote: res.middlelocals.remote, id: req.params.id })
    .then(route => {
      if (route === undefined) throw createHttpError(404, 'There\'s no route.')

      res.locals.route = route

      next()
    })
    .catch(next)
)

/**
 * @swagger
 *
 * parameter:
 *   routeID:
 *     in: path
 *     name: routeID
 *     required: true
 *     type: string
 *
 * /{remoteID}/routes/{routeID}?details=true:
 *   get:
 *     summary: Route
 *     description: https://developers.google.com/transit/gtfs/reference#routestxt
 *     tags:
 *       - Route
 *     parameters:
 *       - $ref: '#/parameters/remoteID'
 *       - $ref: '#/parameters/routeID'
 *     responses:
 *       200:
 *         schema:
 *           $ref: '#/definitions/route'
*/
router.get('/:id', (req, res, next) => res.json(res.locals.route.public))

/**
 * @swagger
 *
 * /{remoteID}/routes/{routeID}/geojson:
 *   get:
 *     description: https://developers.google.com/transit/gtfs/reference#shapestxt
 *     tags:
 *       - Route
 *     parameters:
 *       - $ref: '#/parameters/remoteID'
 *       - $ref: '#/parameters/routeID'
 *     responses:
 *       200:
 *         schema:
 *           $ref: '#/definitions/geojson'
*/
router.get('/:id/geojson', async (req, res, next) =>
  Shape.geoJson(res.middlelocals.remote.uid, { routeId: res.locals.route.id })
    .then(shapes => res.json(shapes))
    .catch(next)
)

const routeId_route_dateParamSchema = joi
  .object()
  .keys({
    date: joi.date().format('YYYY-MM-DD')
  })
  .unknown()
const routeId_route_dateQuerySchema = joi
  .object()
  .keys({
    first_arrival_time: joi.date().format('HH:mm:ss'),
    first_departure_time: joi.date().format('HH:mm:ss'),
    details: joi.boolean().default(false)
  })
  .unknown()

/**
 * @swagger
 *
 * definitions:
 *   route:
 *     date:
 *       type: object
 *       allOf:
 *         - $ref: '#/definitions/stop'
 *         - properties:
 *             sequence:
 *               type: number
 *             date:
 *               type: object
 *               properties:
 *                 arrival:
 *                   type: object
 *                   properties:
 *                     schedule:
 *                       type: string
 *                       nullable: true
 *                 departure:
 *                   type: object
 *                   properties:
 *                     schedule:
 *                       type: string
 *                       nullable: true
 *             headsign:
 *               type: string
 *               nullable: true
 *             direction:
 *               type: number
 *               enum: [0, 1]
 *               nullable: true
 *
 * /{remoteID}/routes/{routeID}/route/{date}:
 *   get:
 *     description: 系統番号と日付からtrips, stop_timesを取得(tripの始発時刻を指定すると1つのtripのみ取得できます)
 *     tags:
 *       - Route
 *     parameters:
 *       - $ref: '#/parameters/remoteID'
 *       - $ref: '#/parameters/tripID'
 *       - $ref: '#/parameters/date'
 *       - in: query
 *         name: first_arrival_time
 *         type: string
 *         example: HH:mm:dd
 *       - in: query
 *         name: first_departure_time
 *         type: string
 *         example: HH:mm:dd
 *     responses:
 *       200:
 *         schema:
 *            type: object
 *            properties:
 *              trip_id:
 *                type: array
 *                items:
 *                  $ref: '#/definitions/route/date'
*/
router.get('/:id/route/:date', (req, res, next) => {
  const paramVR = routeId_route_dateParamSchema.validate(req.params, {
    abortEarly: false
  })
  if (paramVR.error) return next(paramVR.error)

  const queryVR = routeId_route_dateQuerySchema.validate(req.query, {
    abortEarly: false
  })
  if (queryVR.error) return next(queryVR.error)

  getManager()
    .transaction(async trn =>
      Trip.findRoutes(
        res.middlelocals.remote.uid,
        {
          routeId: res.locals.route.id,
          firstStop: {
            date: moment(paramVR.value.date, 'YYYY-MM-DD').tz(res.middlelocals.timezone, true),
            time:
              queryVR.value.first_arrival_time || queryVR.value.first_departure_time
                ? {
                  arrival: queryVR.value.first_arrival_time
                    ? moment(queryVR.value.first_arrival_time).tz(res.middlelocals.timezone, true)
                    : undefined,
                  departure: queryVR.value.first_departure_time
                    ? moment(queryVR.value.first_departure_time).tz(res.middlelocals.timezone, true)
                    : undefined
                }
                : undefined
          }
        },
        trn
      ).then(routes => {
        const resData = {}

        routes.forEach(
          route =>
            (resData[route.trip.id] = route.calcStops.map(stop =>
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
            ))
        )

        res.json(resData)
      })
    )
    .catch(next)
})

export default router
