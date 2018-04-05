import { readdir, createReadStream } from 'fs'

import * as csvParser from 'csv-parse'

import { getDataDir } from '../util'

export interface Istop {
  stop_id: string
  stop_code?: string
  stop_name: string
  stop_desc?: null
  stop_lat: number
  stop_lon: number
  zone_id?: string
  stop_url?: null
  location_type?: number
  parent_station?: string
  stop_timezone?: string
  wheelchair_boarding?: string
}

interface Istops {
  [k: string]: {
    [k: string]: Istop
  }
}

export default new Promise<Istops>(resolve => {
  console.log(getDataDir)
  readdir(getDataDir(), async (err, dires) => {
    const companies: Istops = {}

    for (let i = 0; i < dires.length; i++) {
      companies[dires[i]] = await new Promise<{ [k: string]: Istop }>((resolve, reject) => {
        createReadStream(`${getDataDir()}/${dires[i]}/gtfs/stops.txt`).pipe(
          csvParser({ columns: true }, (err: Error, data: Istop[]) => {
            if (err) return reject(err)
            if (!data) return resolve()

            resolve(data.reduce((prev, stop) => ({ ...prev, [stop.stop_id]: stop }), {}))
          })
        )
      })
    }

    resolve(companies)
  })
})
