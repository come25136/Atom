import * as csvParse from 'csv-parse'
import * as fs from 'fs'
import { promisify } from 'util'

import { convertStringFullWidthToHalfWidth, getDataDir } from '../../util'

interface GtfsRawRoutes {
  route_id: string
  agency_id?: string
  route_short_name: string
  route_long_name: string
  route_desc?: string
  route_type: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7'
  route_url?: string
  route_color?: string
  route_text_color?: string
}

interface GtfsRoutes {
  route_id: string
  agency_id: string | null
  route_short_name: string
  route_long_name: string
  route_desc: string | null
  route_type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
  route_url: string | null
  route_color: string | null
  route_text_color: string | null
}

export type getRoutes = {
  [companyName: string]: {
    [routeId: string]: GtfsRoutes
  }
}

const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const csvParser = promisify<string, csvParse.Options, GtfsRawRoutes[]>(csvParse)

const companies: getRoutes = {}

export async function getRoutes(): Promise<getRoutes> {
  if (Object.keys(companies).length) return companies

  const dirs = await readDir(getDataDir())

  for (const dir of dirs) {
    if (fs.statSync(`${getDataDir()}/${dir}`).isDirectory() === false) continue

    const rows: GtfsRawRoutes[] = await csvParser(
      await readFile(`${getDataDir()}/${dir}/gtfs/routes.txt`, 'utf8'),
      {
        columns: true,
        skip_empty_lines: true
      }
    )

    const routes: { [routeId: string]: GtfsRoutes } = {}

    rows.forEach(row => {
      routes[row.route_id] = {
        route_id: row.route_id,
        agency_id: row.agency_id || null,
        route_short_name: convertStringFullWidthToHalfWidth(row.route_short_name),
        route_long_name: convertStringFullWidthToHalfWidth(row.route_long_name),
        route_desc: convertStringFullWidthToHalfWidth(row.route_desc || null),
        route_type: Number(row.route_type) as GtfsRoutes['route_type'],
        route_url: row.route_url || null,
        route_color: row.route_color || null,
        route_text_color: row.route_text_color || null
      }
    })

    companies[dir] = routes
  }

  return companies
}
