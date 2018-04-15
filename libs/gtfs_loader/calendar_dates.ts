import { promisify } from 'util'

import * as fs from 'fs'

import * as csvParse from 'csv-parse'

import { getDataDir } from '../util'

interface row {
  service_id: string
  date: string
  exception_type: number
}

export interface calendarDates {
  // バス会社名(ディレクトリ名)
  [k: string]: {
    // trip_id
    [k: string]: row
  }
}

const readDir = promisify(fs.readdir),
  readFile = promisify(fs.readFile),
  csvParser = promisify<string, csvParse.Options, row[]>(csvParse)

const companies: calendarDates = {}

export default async function() {
  if (Object.keys(companies).length) return companies

  const dirs = await readDir(getDataDir())

  for (let dir of dirs) {
    const routes: { [k: string]: row[] } = {},
      rows = await csvParser(await readFile(`${getDataDir()}/${dir}/gtfs/calendar.txt`, 'utf8'), {
        columns: true
      })

    companies[dir] = rows && rows.reduce((prev, stop) => ({ ...prev, [stop.service_id]: stop }), {})
  }

  return companies
}
