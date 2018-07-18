import { promisify } from 'util'

import * as fs from 'fs'

import * as csvParse from 'csv-parse'

import { getDataDir } from '../util'

export interface Istop {
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

export interface Istops {
  [k: string]: {
    [k: string]: Istop
  }
}

const readDir = promisify(fs.readdir),
  readFile = promisify(fs.readFile),
  csvParser = promisify<string, csvParse.Options, Istop[]>(csvParse)

const companies: Istops = {}

export default async function() {
  if (Object.keys(companies).length) return companies

  const dirs = await readDir(getDataDir())

  for (let dir of dirs) {
    if (fs.statSync(`${getDataDir()}/${dir}`).isFile()) continue

    const rows = await csvParser(await readFile(`${getDataDir()}/${dir}/gtfs/stops.txt`, 'utf8'), {
      columns: true
    })

    companies[dir] = rows && rows.reduce((prev, stop) => ({ ...prev, [stop.stop_id]: stop }), {})
  }

  return companies
}
