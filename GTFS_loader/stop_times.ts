import { createReadStream } from 'fs'

import * as csvParser from 'csv-parse'

export interface Istop {
  trip_id: string
  arrival_time: string
  departure_time: string
  stop_id: string
  stop_sequence: number
  stop_headsign: string
  pickup_type: number
  drop_off_type: number
}

export default new Promise<{ [k: string]: { [k: string]: Istop[] } }>(
  resolve => {
    const routes: { [k: string]: { [k: string]: Istop[] } } = {}

    createReadStream('./GTFS/stop_times.txt').pipe(
      csvParser({ columns: true }, (err: Error, data: Istop[]) => {
        data.forEach(stop => {
          const trip_ids = stop.trip_id.split('_'),
            type = trip_ids[0] === '平日' ? 'weekday' : 'holiday',
            id = `${type}_${trip_ids[2].substr(2)}`,
            time = `${trip_ids[1].substr(0, 2)}:${trip_ids[1].substr(3, 2)}`,
            stops = routes[id]

          routes[id] =
            typeof stops === 'undefined'
              ? { [time]: [stop] }
              : stops[time]
                ? Object.assign(stops, { [time]: [...stops[time], stop] })
                : Object.assign(stops, { [time]: [stop] })
        })

        resolve(routes)
      })
    )
  }
)
