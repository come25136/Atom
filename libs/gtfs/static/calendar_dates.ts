import * as csvParse from 'csv-parse'
import * as fs from 'fs'
import * as moment from 'moment'
import { promisify } from 'util'

import { getDataDir } from '../../util'

interface GtfsRawCalendarDate {
  service_id: string
  date: string
  exception_type: '1' | '2'
}

interface GtfsCalendarDate {
  service_id: string
  date: moment.Moment
  exception_type: 1 | 2
}

export type getCalendarDates = {
  [companyName: string]: {
    [tripId: string]: GtfsCalendarDate[]
  }
}

const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const csvParser = promisify<string, csvParse.Options, GtfsRawCalendarDate[]>(csvParse)

const companies: getCalendarDates = {}

export async function getCalendarDates(): Promise<getCalendarDates> {
  if (Object.keys(companies).length) return companies

  const dirs = await readDir(getDataDir())

  for (const dir of dirs) {
    if (fs.statSync(`${getDataDir()}/${dir}`).isDirectory() === false) continue

    const rows: GtfsRawCalendarDate[] = await csvParser(
      await readFile(`${getDataDir()}/${dir}/gtfs/calendar_dates.txt`, 'utf8'),
      {
        columns: true
      }
    )

    const calendar: { [tripId: string]: GtfsCalendarDate[] } = {}

    rows.forEach(row => {
      if (!calendar[row.service_id]) calendar[row.service_id] = []

      calendar[row.service_id].push({
        service_id: row.service_id,
        date: moment(row.date, 'YYYYMMDD'),
        exception_type: Number(row.exception_type) as GtfsCalendarDate['exception_type']
      })
    })

    companies[dir] = calendar
  }

  return companies
}
