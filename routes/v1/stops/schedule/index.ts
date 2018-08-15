import * as moment from 'moment'

import { Router } from 'express'

import { dateToServiceIds, h24ToLessH24 } from '../../../../libs/util'

import stops from '../../../../libs/gtfs_loader/stops'
import stop_times from '../../../../libs/gtfs_loader/stop_times'
import trips from '../../../../libs/gtfs_loader/trips'

const router = Router({ mergeParams: true })

router.get('/(:date)?', (req, res) =>
  stops()
    .then(async stops => {
      if (!stops[req.params.companyName])
        return res.status(404).json({ error: { message: 'There is no such bus company.' } })

      if (!stops[req.params.companyName][req.params.id])
        return res.status(404).json({ error: { message: 'There is no such bus stop.' } })

      const stopTimes = await stop_times()

      const standardDate = req.params.date ? moment(req.params.date) : moment()

      const timetable = (await trips().then(async trips =>
        (await dateToServiceIds(req.params.companyName, standardDate)).map(serviceId =>
          Object.values(trips[req.params.companyName]).reduce(
            (prev: { route: { id: string }; date: string }[], route) => {
              const time = Object.values(route).reduce(
                (prev: { route: { id: string }; date: string }[], trip) => {
                  const stop = stopTimes[req.params.companyName][trip.trip_id].find(
                    stop => stop.stop_id === req.params.id
                  )

                  return serviceId === trip.service_id && stop
                    ? [
                        ...prev,
                        {
                          route: {
                            id: trip.route_id,
                            headsign: stop.stop_headsign || trip.trip_headsign
                          },
                          date: h24ToLessH24(stop.arrival_time, standardDate).format()
                        }
                      ]
                    : prev
                },
                []
              )

              return time.length === 0 ? prev : [...prev, ...time]
            },
            []
          )
        )
      ))
        .reduce((prev, current) => [...prev, ...current], [])
        .sort((a, b) => (moment(a.date).isBefore(moment(b.date), 'm') ? -1 : 1))

      res.json(timetable)
    })
    .catch(err => {
      res.status(500).end()
      throw err
    })
)

export default router
