import { promisify } from 'util'

import * as fs from 'fs'

import * as csvParse from 'csv-parse'

import { getDataDir } from '../util'

interface row {
  service_id: string
  monday: number
  tuesday: number
  wednesday: number
  thursday: number
  friday: number
  saturday: number
  sunday: number
  start_date: string
  end_date: string
}

export interface calendar {
  // バス会社名(ディレクトリ名)
  [k: string]: {
    // service_id
    [k: string]: row
  }
}

const readDir = promisify(fs.readdir),
  readFile = promisify(fs.readFile),
  csvParser = promisify<string, csvParse.Options, row[]>(csvParse)

const companies: calendar = {}

export default async function() {
  if (Object.keys(companies).length) return companies

  const dirs = await readDir(getDataDir())

  for (let dir of dirs) {
    const routes: { [k: string]: row[] } = {},
      rows = await csvParser(await readFile(`${getDataDir()}/${dir}/gtfs/calendar.txt`, 'utf8'), {
        columns: true
      })

    companies[dir] = rows.reduce(
      (prev: { [k: string]: row }, stop) => ({
        ...prev,
        [stop.service_id]: {
          service_id: stop.service_id,
          monday: Number(stop.monday),
          tuesday: Number(stop.tuesday),
          wednesday: Number(stop.wednesday),
          thursday: Number(stop.thursday),
          friday: Number(stop.friday),
          saturday: Number(stop.saturday),
          sunday: Number(stop.sunday),
          start_date: stop.start_date,
          end_date: stop.end_date
        }
      }),
      {}
    )
  }

  return companies
}
