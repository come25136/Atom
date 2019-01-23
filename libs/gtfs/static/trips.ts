import * as csvParse from 'csv-parse'
import * as fs from 'fs'
import { promisify } from 'util'

import { convertStringFullWidthToHalfWidth, getDataDir } from '../../util'

interface GtfsRawTrip {
  route_id: string
  service_id: string
  trip_id: string
  trip_headsign?: string
  trip_short_name?: string
  direction_id?: '0' | '1'
  block_id?: string
  shape_id?: string
  wheelchair_accessible?: '0' | '1' | '2'
  bikes_allowed?: '0' | '1' | '2'
}

export interface GtfsTrip {
  route_id: string
  service_id: string
  trip_id: string
  trip_headsign: string | null
  trip_short_name: string | null
  direction_id: null | 0 | 1
  block_id?: string
  shape_id?: string
  wheelchair_accessible: 0 | 1 | 2
  bikes_allowed: 0 | 1 | 2
}

export type getTrips = {
  [companyName: string]: {
    [routeId: string]: {
      [tripId: string]: GtfsTrip
    }
  }
}

const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const csvParser = promisify<string, csvParse.Options, GtfsRawTrip[]>(csvParse)

const companies: getTrips = {}

export async function getTrips(): Promise<getTrips> {
  if (Object.keys(companies).length) return companies

  const dirs: string[] = await readDir(getDataDir())

  for (let dir of dirs) {
    if (fs.statSync(`${getDataDir()}/${dir}`).isDirectory() === false) continue

    const rows: GtfsRawTrip[] = await csvParser(
      await readFile(`${getDataDir()}/${dir}/gtfs/trips.txt`, 'utf8'),
      {
        columns: true
      }
    )

    companies[dir] = rows.reduce(
      (prev: { [k: string]: { [k: string]: GtfsTrip } }, stop) => ({
        ...prev,
        [stop.route_id]: {
          ...prev[stop.route_id],
          [stop.trip_id]: Object.assign(stop, {
            trip_headsign: convertStringFullWidthToHalfWidth(stop.trip_headsign || null),
            direction_id: stop.direction_id === undefined ? null : Number(stop.direction_id),
            wheelchair_accessible:
              stop.wheelchair_accessible === undefined ? 0 : Number(stop.wheelchair_accessible),
            bikes_allowed: stop.bikes_allowed === undefined ? 0 : Number(stop.bikes_allowed)
          })
        }
      }),
      {}
    )
  }

  return companies
}
