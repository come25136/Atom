import * as csvParse from 'csv-parse'
import * as fs from 'fs'
import { promisify } from 'util'

import { convertStringFullWidthToHalfWidth, getDataDir } from '../../util'

interface GtfsRawAgency {
  agency_id?: string
  agency_name: string
  agency_url: string
  agency_timezone: string
  agency_lang?: string
  agency_phone?: string
  agency_fare_url?: string
  agency_email?: string
}

interface GtfsAgency {
  agency_id: string | null
  agency_name: string
  agency_url: string
  agency_timezone: string
  agency_lang: string | null
  agency_phone: string | null
  agency_fare_url: string | null
  agency_email: string | null
}

export type getAgency = {
  [companyName: string]: GtfsAgency[]
}

const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const csvParser = promisify<string, csvParse.Options, GtfsRawAgency[]>(csvParse)

const companies: getAgency = {}

export async function getAgency(): Promise<getAgency> {
  if (Object.keys(companies).length) return companies

  const dirs: string[] = await readDir(getDataDir())

  for (const dir of dirs) {
    if (fs.statSync(`${getDataDir()}/${dir}`).isDirectory() === false) continue

    const rows = await csvParser(await readFile(`${getDataDir()}/${dir}/gtfs/agency.txt`, 'utf8'), {
      columns: true,
      skip_empty_lines: true
    })

    companies[dir] = rows.map(row => ({
      agency_id: row.agency_id || null,
      agency_name: convertStringFullWidthToHalfWidth(row.agency_name),
      agency_url: row.agency_url,
      agency_timezone: row.agency_timezone,
      agency_lang: row.agency_lang || null,
      agency_phone: row.agency_phone || null,
      agency_fare_url: row.agency_fare_url || null,
      agency_email: row.agency_email || null
    }))
  }

  return companies
}
