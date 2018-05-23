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
    [k: string]: row[]
  }
}

const readDir = promisify(fs.readdir),
  readFile = promisify(fs.readFile),
  csvParser = promisify<string, csvParse.Options, row[]>(csvParse)

const companies: calendarDates = {}

export default async function() {
  if (Object.keys(companies).length) return companies

  const dirs = await readDir(getDataDir())

  for (const dir of dirs) {
    const routes: { [k: string]: row[] } = {},
      rows = await csvParser(await readFile(`${getDataDir()}/${dir}/gtfs/calendar_dates.txt`, 'utf8'), {
        columns: true
      })

    const calendar: { [k: string]: row[] } = {}

    rows.forEach(row => {
      if (!calendar[row.service_id]) calendar[row.service_id] = []

      row.exception_type = Number(row.exception_type)

      calendar[row.service_id].push(row)
    })

    companies[dir] = calendar
  }

  return companies
}
