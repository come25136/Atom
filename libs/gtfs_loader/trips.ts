import { promisify } from 'util'

import * as fs from 'fs'

import * as csvParse from 'csv-parse'

import { getDataDir } from '../util'

interface Itrip {
  route_id: string
  service_id: string
  trip_id: string
  trip_headsign?: string
  trip_short_name?: string
  direction_id?: number
  block_id?: string
  shape_id?: string
  wheelchair_accessible?: number
  bikes_allowed?: number
}

export interface Itrips {
  [k: string]: {
    [k: string]: {
      [k: string]: Itrip
    }
  }
}

const readDir = promisify(fs.readdir),
  readFile = promisify(fs.readFile),
  csvParser = promisify<string, csvParse.Options, Itrip[]>(csvParse)

const companies: Itrips = {}

export default async function() {
  if (Object.keys(companies).length) return companies

  const dirs = await readDir(getDataDir())

  for (let dir of dirs) {
    const rows = await csvParser(await readFile(`${getDataDir()}/${dir}/gtfs/trips.txt`, 'utf8'), {
      columns: true
    })

    companies[dir] = rows.reduce(
      (prev: { [k: string]: { [k: string]: Itrip } }, stop) => ({
        ...prev,
        [stop.route_id]: {
          ...prev[stop.route_id],
          [stop.trip_id]: Object.assign(stop, {
            direction_id: Number(stop.direction_id),
            wheelchair_accessible: Number(stop.wheelchair_accessible),
            bikes_allowed: Number(stop.bikes_allowed)
          })
        }
      }),
      {}
    )
  }

  return companies
}
