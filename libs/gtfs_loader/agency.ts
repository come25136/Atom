import { promisify } from 'util'

import * as fs from 'fs'

import * as csvParse from 'csv-parse'

import { getDataDir } from '../util'

interface row {
  agency_id?: string
  agency_name: string
  agency_url: string
  agency_timezone: string
  agency_lang?: string
  agency_phone?: string
  agency_fare_url?: string
  agency_email?: string
}

export interface calendarDates {
  // バス会社名(ディレクトリ名)
  [k: string]: row
}

const readDir = promisify(fs.readdir),
  readFile = promisify(fs.readFile),
  csvParser = promisify<string, csvParse.Options, row[]>(csvParse)

const companies: calendarDates = {}

export default async function() {
  if (Object.keys(companies).length) return companies

  const dirs = await readDir(getDataDir())

  for (const dir of dirs) {
    if (fs.statSync(`${getDataDir()}/${dir}`).isFile()) continue

    const [row] = await csvParser(
      await readFile(`${getDataDir()}/${dir}/gtfs/agency.txt`, 'utf8'),
      {
        columns: true
      }
    )

    companies[dir] = {
      agency_id: row.agency_id ? row.agency_id : undefined,
      agency_name: row.agency_name,
      agency_url: row.agency_url,
      agency_timezone: row.agency_timezone,
      agency_lang: row.agency_lang ? row.agency_lang : undefined,
      agency_phone: row.agency_phone ? row.agency_phone : undefined,
      agency_fare_url: row.agency_fare_url ? row.agency_fare_url : undefined,
      agency_email: row.agency_email ? row.agency_email : undefined
    }
  }

  return companies
}
