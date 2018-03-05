import { createReadStream } from 'fs'

import * as csvParser from 'csv-parse'

interface Istop {
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

export default async (): Promise<Map<string, Istop>> => {
  return new Promise<Map<string, Istop>>((resolve, reject) => {
    createReadStream('./GTFS/stops.txt')
      .pipe(
        csvParser(
          { columns: true },
          (err: Error, data: Istop[]) => {
            if (err) {
              return reject(err)
            }

            const stops = new Map<string, Istop>()
            data.forEach(stop => stops.set(stop.stop_id, stop))
            return resolve(stops)
          }
      )
    )
  })
}