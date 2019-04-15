import * as csvParse from 'csv-parse'
import * as fs from 'fs'
import * as moment from 'moment'
import { promisify } from 'util'

import { getDataDir } from '../../util'

interface GtfsRawCalendar {
  service_id: string
  monday: '0' | '1'
  tuesday: '0' | '1'
  wednesday: '0' | '1'
  thursday: '0' | '1'
  friday: '0' | '1'
  saturday: '0' | '1'
  sunday: '0' | '1'
  start_date: string
  end_date: string
}

interface GtfsCalendar {
  service_id: string
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
  start_date: moment.Moment
  end_date: moment.Moment
}

export type getCalendars = {
  [companyName: string]: {
    [serviceId: string]: GtfsCalendar
  }
}

const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const csvParser = promisify<string, csvParse.Options, GtfsRawCalendar[]>(csvParse)

const companies: getCalendars = {}

export async function getCalendars(): Promise<getCalendars> {
  if (Object.keys(companies).length) return companies

  const dirs = await readDir(getDataDir())

  for (let dir of dirs) {
    if (fs.statSync(`${getDataDir()}/${dir}`).isDirectory() === false) continue

    const rows: GtfsRawCalendar[] = await csvParser(
      await readFile(`${getDataDir()}/${dir}/gtfs/calendar.txt`, 'utf8').catch(() => ''),
      {
        columns: true,
        skip_empty_lines: true
      }
    )

    companies[dir] = rows.reduce(
      (
        prev: { [serviceId: string]: GtfsCalendar },
        stop
      ): { [serviceId: string]: GtfsCalendar } => ({
        ...prev,
        [stop.service_id]: {
          service_id: stop.service_id,
          monday: stop.monday === '1',
          tuesday: stop.tuesday === '1',
          wednesday: stop.wednesday === '1',
          thursday: stop.thursday === '1',
          friday: stop.friday === '1',
          saturday: stop.saturday === '1',
          sunday: stop.sunday === '1',
          start_date: moment(stop.start_date, 'YYYYMMDD'),
          end_date: moment(stop.end_date, 'YYYYMMDD')
        }
      }),
      {}
    )
  }

  return companies
}
