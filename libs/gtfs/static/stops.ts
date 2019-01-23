import * as csvParse from 'csv-parse'
import * as fs from 'fs'
import { promisify } from 'util'

import { convertStringFullWidthToHalfWidth, getDataDir } from '../../util'

export interface GtfsStop {
  stop_id: string
  stop_code?: string
  stop_name: string
  stop_desc?: string
  stop_lat: number
  stop_lon: number
  zone_id?: string
  stop_url?: string
  location_type?: number
  parent_station?: string
  stop_timezone?: string
  wheelchair_boarding?: string
}

export type getStops = {
  [companyName: string]: {
    [stopId: string]: GtfsStop
  }
}

const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const csvParser = promisify<string, csvParse.Options, GtfsStop[]>(csvParse)

const companies: getStops = {}

export async function getStops(): Promise<getStops> {
  if (Object.keys(companies).length) return companies

  const dirs = await readDir(getDataDir())

  for (let dir of dirs) {
    if (fs.statSync(`${getDataDir()}/${dir}`).isDirectory() === false) continue

    const rows = await csvParser(await readFile(`${getDataDir()}/${dir}/gtfs/stops.txt`, 'utf8'), {
      columns: true
    })

    companies[dir] =
      rows &&
      rows.reduce(
        (prev, stop) => ({
          ...prev,
          [stop.stop_id]: Object.assign({}, stop, {
            stop_lat: Number(stop.stop_lat),
            stop_lon: Number(stop.stop_lon)
          })
        }),
        {}
      )
  }

  return companies
}
