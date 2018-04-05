import { createReadStream } from 'fs'

import * as csvParser from 'csv-parse'

export interface Istop {
  stop_id: string
  stop_code: string
  stop_name: string
  stop_desc: null
  stop_lat: number
  stop_lon: number
  zone_id: string
  stop_url: null
  location_type: number
}

export default new Promise<{ [k: string]: Istop }>((resolve, reject) => {
  createReadStream('./GTFS/stops.txt').pipe(
    csvParser({ columns: true }, (err: Error, data: Istop[]) => {
      if (err) return reject(err)
      if (!data) return resolve()

      resolve(
        data.reduce((prev, stop) => ({ ...prev, [stop.stop_id]: stop }), {})
      )
    })
  )
})
