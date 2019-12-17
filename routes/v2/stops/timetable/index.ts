import { Router } from 'express'
import * as createHttpError from 'http-errors'
import * as _ from 'lodash'
import * as moment from 'moment-timezone'
import { getManager, In } from 'typeorm'

import { Stop } from '../../../../db/entitys/gtfs/stop'
import { StopTime } from '../../../../db/entitys/gtfs/stop_time'
import { Trip } from '../../../../db/entitys/gtfs/trip'
import joi from '../../../../libs/joi'
import { h24ToLessH24 } from '../../../../libs/util'
import { getGtfes } from '../../../../stores'

const router = Router({ mergeParams: true })

interface Row {
  trip: {
    id: string
  }
  headsign: string | null
  date: {
    arrival: {
      schedule: string
    }
    departure: {
      schedule: string
    }
  }
}

const rootParamSchema = joi
  .object()
  .keys({
    date: joi.date().format('YYYY-MM-DD')
  })
  .unknown()

/**
 * @swagger
 *
 * /{remoteID}/stops/{stopID}/timetable/{date}:
 *   get:
 *     description: 時刻表
 *     tags:
 *       - Stop
 *     parameters:
 *       - $ref: '#/parameters/remoteID'
 *       - $ref: '#/parameters/stopID'
 *       - $ref: '#/parameters/date'
 *     responses:
 *       200:
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               trip:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *               headsign:
 *                 type: string
 *                 nullable: true
 *               date:
 *                 type: object
 *                 properties:
 *                   arrival:
 *                     type: object
 *                     properties:
 *                       schedule:
 *                         type: string
 *                   departure:
 *                     type: object
 *                     properties:
 *                       schedule:
 *                         type: string
*/
router.get('/:date', async (req, res, next) =>
  getGtfes(req.params.remoteId)
    .then(async ([remote]) => {
      const paramVR = rootParamSchema.validate(req.params, {
        abortEarly: false
      })
      if (paramVR.error) throw paramVR.error

      const standardDate = moment(paramVR.value.date).tz(res.middlelocals.timezone, true)

      const trips = await getManager().transaction(async trn => {
        const serviceIds = await Trip.findServiceIds(remote.uid, standardDate, trn)

        if (serviceIds.length === 0) throw createHttpError(404, 'There\'s no service ID.')

        // NOTE: ORM? I don't know.
        const trips = (await trn
          .getRepository(Trip)
          .createQueryBuilder('trip')
          .innerJoinAndMapOne(
            'trip.stopTime',
            'trip.stopTimes',
            'stop_time',
            'trip.remoteUid = :remoteUid AND `trip`.`id` = `stop_time`.`tripId` AND trip.serviceId IN (:...serviceIds) AND `stop_time`.`stopUid` = :stopUid',
            {
              remoteUid: remote.uid,
              serviceIds,
              stopUid: res.locals.stop.uid
            }
          )
          .getMany()) as (Trip & { stopTime: StopTime })[]

        return trips
      })

      const timetable: Row[] =
        trips.map(trip => ({
          trip: {
            id: trip.id
          },
          headsign: trip.stopTime.headsign || trip.headsign,
          sequence: trip.stopTime.sequence,
          date: {
            arrival: {
              schedule: h24ToLessH24(trip.stopTime.arrivalTime.tz(res.middlelocals.timezone), standardDate)
            },
            departure: {
              schedule: h24ToLessH24(trip.stopTime.departureTime.tz(res.middlelocals.timezone), standardDate)
            }
          }
        }))
          .sort((a, b) => a.date.departure.schedule.isBefore(b.date.departure.schedule) ? -1 : 1)
          .map(data => Object.assign(data, {
            date: {
              arrival: {
                schedule: data.date.arrival.schedule.format()
              },
              departure: {
                schedule: data.date.departure.schedule.format()
              }
            }
          }))

      res.json(timetable)
    })
    .catch(next)
)

export default router
