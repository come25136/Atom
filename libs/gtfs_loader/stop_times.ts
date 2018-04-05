import { promisify } from 'util'

import { readdir, createReadStream } from 'fs'

import * as csvParser from 'csv-parse'

import { getDataDir } from '../util'

export interface Istop {
  trip_id: string
  arrival_time: string
  departure_time: string
  stop_id: string
  stop_sequence: number
  stop_headsign?: string
  pickup_type?: number
  drop_off_type?: number
  shape_dist_traveled?: string
  timepoint?: string
}

interface IstopTimes {
  // バス会社名(ディレクトリ名)
  [k: string]: {
    // trip_id
    [k: string]: Istop[]
  }
}

export default new Promise<IstopTimes>(resolve => {
  readdir(getDataDir(), async (err, dires) => {
    const companies: IstopTimes = {}

    for (let i = 0; i < dires.length; i++) {
      companies[dires[i]] = await new Promise<{ [k: string]: Istop[] }>(resolve => {
        const routes: { [k: string]: Istop[] } = {}

        createReadStream(`${getDataDir()}/${dires[i]}/gtfs/stop_times.txt`).pipe(
          csvParser({ columns: true }, (err, data: Istop[]) => {
            data.forEach(stop => {
              if (!routes[stop.trip_id]) routes[stop.trip_id] = []
              routes[stop.trip_id].push(stop)
            })

            for (const stops of Object.values(routes))
              stops.sort((a, b) => a.stop_sequence - b.stop_sequence)

            resolve(routes)
          })
        )
      })
    }

    resolve(companies)
  })
})
