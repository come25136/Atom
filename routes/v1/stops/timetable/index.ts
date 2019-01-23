import { Router } from 'express'
import * as createHttpError from 'http-errors'
import * as moment from 'moment'

import { getStops, getStopTimes, getTrips } from '../../../../libs/gtfs/static'
import { getRoutesStops, RouteStop } from '../../../../libs/route'
import { dateToServiceIds, h24ToLessH24 } from '../../../../libs/util'

const router = Router({ mergeParams: true })

interface Row {
  route: {
    id: string
    headsign: string | null
    routes?: {
      id: RouteStop['id']
      date: RouteStop['date']
    }[][]
  }
  date: string
}

router.get('/(:date)?', async (req, res, next) =>
  getStops()
    .then(async stops => {
      if (!stops[req.params.companyName])
        return next(createHttpError(404, 'There is no such company.'))

      if (!stops[req.params.companyName][req.params.id])
        return next(createHttpError(404, 'There is no such bus stop.'))

      const stopTimes = await getStopTimes()

      const standardDate = req.params.date ? moment(req.params.date) : moment()

      const trips = await getTrips()

      const timetable = await Promise.all(
        (await dateToServiceIds(req.params.companyName, standardDate)).map(async serviceId =>
          Object.values(trips[req.params.companyName]).reduce(async (prevPromise, route) => {
            const time = await Object.values(route).reduce(async (prevPromise, trip): Promise<
              Row[]
            > => {
              const stop = stopTimes[req.params.companyName][trip.trip_id].find(
                stop => stop.stop_id === req.params.id
              )

              return serviceId === trip.service_id && stop
                ? [
                    ...(await prevPromise),
                    {
                      route: {
                        id: trip.route_id,
                        headsign: stop.stop_headsign || trip.trip_headsign,
                        routes:
                          req.query.details === 'true'
                            ? await getRoutesStops(
                                req.params.companyName,
                                trip.route_id,
                                standardDate,
                                true
                              ).then(routes =>
                                routes.map(route =>
                                  route.map(stop => ({ id: stop.id, date: stop.date }))
                                )
                              )
                            : undefined
                      },
                      date: h24ToLessH24(stop.arrival_time, standardDate).format()
                    }
                  ]
                : prevPromise
            }, Promise.resolve<Row[]>([]))

            return time.length === 0 ? await prevPromise : [...(await prevPromise), ...time]
          }, Promise.resolve<Row[]>([]))
        )
      ).then(rows =>
        rows
          .reduce((prev, current) => [...prev, ...current], [])
          .sort((a, b) => (moment(a.date).isBefore(moment(b.date), 'm') ? -1 : 1))
      )

      res.json(timetable)
    })
    .catch(next)
)

export default router
