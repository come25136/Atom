import * as moment from 'moment'

import { Router } from 'express'

import { dateToServiceIds, h24ToLessH24 } from '../../../../libs/util'
import { route as _route, route } from '../../../../libs/route'

import _stops from '../../../../libs/gtfs_loader/stops'
import _stop_times from '../../../../libs/gtfs_loader/stop_times'
import _trips from '../../../../libs/gtfs_loader/trips'

const router = Router({ mergeParams: true })

interface row {
  route: {
    id: string
    headsign?: string
    routes?: {
      id: route['id']
      date: route['date']
    }[][]
  }
  date: string
}

router.get('/(:date)?', (req, res) =>
  _stops()
    .then(async stops => {
      if (!stops[req.params.companyName])
        return res.status(404).json({ error: { message: 'There is no such bus company.' } })

      if (!stops[req.params.companyName][req.params.id])
        return res.status(404).json({ error: { message: 'There is no such bus stop.' } })

      const stopTimes = await _stop_times()

      const standardDate = req.params.date ? moment(req.params.date) : moment()

      const trips = await _trips()

      const timetable = await Promise.all(
        (await dateToServiceIds(req.params.companyName, standardDate)).map(serviceId =>
          Object.values(trips[req.params.companyName]).reduce(async (prevPromise, route) => {
            const time = await Object.values(route).reduce(async (prevPromise, trip): Promise<
              row[]
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
                            ? await _route(
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
                : await prevPromise
            }, Promise.resolve<row[]>([]))

            return time.length === 0 ? await prevPromise : [...(await prevPromise), ...time]
          }, Promise.resolve<row[]>([]))
        )
      ).then(rows =>
        rows
          .reduce((prev, current) => [...prev, ...current], [])
          .sort((a, b) => (moment(a.date).isBefore(moment(b.date), 'm') ? -1 : 1))
      )

      res.json(timetable)
    })
    .catch(err => {
      res.status(500).end()
      throw err
    })
)

export default router
