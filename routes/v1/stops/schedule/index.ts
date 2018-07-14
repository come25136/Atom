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

      res.json(
        (await trips().then(async trips =>
          (await dateToServiceIds(
            req.params.companyName,
            req.params.date ? moment(req.params.date) : moment()
          )).map(serviceId =>
            Object.values(trips[req.params.companyName]).reduce(
              (prev: { route: { id: string }; time: string }[], route) => {
                const time = Object.values(route).reduce(
                  (prev: { route: { id: string }; time: string }[], trip) => {
                    const stop = stopTimes[req.params.companyName][trip.trip_id].find(
                      stop => stop.stop_id === req.params.id
                    )

                    return serviceId === trip.service_id && stop
                      ? [...prev, { route: { id: trip.route_id }, time: stop.arrival_time }]
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
          .sort((a, b) => (h24ToLessH24(a.time).isBefore(h24ToLessH24(b.time), 'm') ? -1 : 1))
      )
    })
    .catch(err => {
      res.status(500).end()
      throw err
    })
)

export default router
