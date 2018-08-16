import { promisify } from 'util'

import * as fs from 'fs'

import * as csvParse from 'csv-parse'

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

export interface IstopTimes {
  // バス会社名(ディレクトリ名)
  [k: string]: {
    // trip_id
    [k: string]: Istop[]
  }
}

const readDir = promisify(fs.readdir),
  readFile = promisify(fs.readFile),
  csvParser = promisify<string, csvParse.Options, Istop[]>(csvParse)

const companies: IstopTimes = {}

export default async function() {
  if (Object.keys(companies).length) return companies

  const dirs = await readDir(getDataDir())

  for (const dir of dirs) {
    if (fs.statSync(`${getDataDir()}/${dir}`).isFile()) continue

    const routes: { [k: string]: Istop[] } = {},
      rows = await csvParser(await readFile(`${getDataDir()}/${dir}/gtfs/stop_times.txt`, 'utf8'), {
        columns: true
      })

    rows.forEach(stop => {
      if (!routes[stop.trip_id]) routes[stop.trip_id] = []
      routes[stop.trip_id].push(
        Object.assign({}, stop, { stop_sequence: Number(stop.stop_sequence) })
      )
    })

    for (const stops of Object.values(routes))
      stops.sort((a, b) => a.stop_sequence - b.stop_sequence)

    companies[dir] = routes
  }

  return companies
}
