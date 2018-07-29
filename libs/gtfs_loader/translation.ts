import { promisify } from 'util'

import * as fs from 'fs'

import * as csvParse from 'csv-parse'

import { getDataDir } from '../util'

interface Itranslation {
  trans_id: string
  lang: string
  translation: string
}

export interface Inames {
  ja: string
  'ja-Hira': string
  en?: string
}

export interface Itranslations {
  [k: string]: {
    [k: string]: Inames
  }
}

const readDir = promisify(fs.readdir),
  readFile = promisify(fs.readFile),
  csvParser = promisify<string, csvParse.Options, Itranslation[]>(csvParse)

const companies: Itranslations = {}

export default async function() {
  if (Object.keys(companies).length) return companies

  const dirs = await readDir(getDataDir())

  for (let dir of dirs) {
    if (fs.statSync(`${getDataDir()}/${dir}`).isFile()) continue

    const stops: { [k: string]: Inames } = {},
      rows = await csvParser(
        await readFile(`${getDataDir()}/${dir}/gtfs/translations.txt`, 'utf8'),
        {
          columns: true
        }
      )

    rows.forEach(
      stop =>
        (stops[stop.trans_id] = Object.assign(
          { ja: '', 'ja-Hira': '', en: undefined },
          stops[stop.trans_id],
          {
            [stop.lang]: stop.translation
          }
        ))
    )

    companies[dir] = stops
  }

  return companies
}
