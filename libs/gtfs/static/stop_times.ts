import * as csvParse from 'csv-parse'
import * as fs from 'fs'
import { promisify } from 'util'

import { getDataDir } from '../../util'

export interface GtfsStopTime {
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

export type getStopTimes = {
  [companyName: string]: {
    [tripId: string]: GtfsStopTime[]
  }
}

const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const csvParser = promisify<string, csvParse.Options, GtfsStopTime[]>(csvParse)

const companies: getStopTimes = {}

export async function getStopTimes(): Promise<getStopTimes> {
  if (Object.keys(companies).length) return companies

  const dirNames = await readDir(getDataDir())

  for (const dirName of dirNames) {
    if (fs.statSync(`${getDataDir()}/${dirName}`).isDirectory() === false) continue

    const routes: { [k: string]: GtfsStopTime[] } = {}
    const rows = await csvParser(
      await readFile(`${getDataDir()}/${dirName}/gtfs/stop_times.txt`, 'utf8'),
      {
        columns: true
      }
    )

    rows.forEach(stop => {
      if (!routes[stop.trip_id]) routes[stop.trip_id] = []
      routes[stop.trip_id].push(
        Object.assign({}, stop, { stop_sequence: Number(stop.stop_sequence) })
      )
    })

    for (const stops of Object.values(routes))
      stops.sort((a, b) => a.stop_sequence - b.stop_sequence)

    companies[dirName] = routes
  }

  return companies
}
