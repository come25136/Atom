import { promisify } from 'util'

import * as fs from 'fs'

import * as csvParse from 'csv-parse'

import { getDataDir, translate } from '../util'

interface Itranslation {
  trans_id: string
  lang: string
  translation: string
}

export interface Inames {
  ja: string
  'ja-Hira': string
  'ja-Kana': string
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

    const rows = await csvParser(
      await readFile(`${getDataDir()}/${dir}/gtfs/translations.txt`, 'utf8'),
      {
        columns: true
      }
    )

    let stops: { [k: string]: Inames } = {}

    rows.forEach(
      stop =>
        (stops[stop.trans_id] = Object.assign(
          { ja: '', 'ja-Hira': undefined, 'ja-Kana': undefined, en: undefined },
          stops[stop.trans_id],
          {
            [stop.lang]: stop.translation
          }
        ))
    )

    stops = Object.entries(stops).reduce(
      (prev, [key, stop]) => ({
        ...prev,
        [key]: Object.assign(
          {},
          stop,
          {
            ja: stop.ja.replace(/[Ａ-Ｚａ-ｚ０-９]/g, char =>
              String.fromCharCode(char.charCodeAt(0) - 0xfee0)
            )
          },
          stop['ja-Hira'] && !stop['ja-Kana']
            ? { 'ja-Kana': translate(stop['ja-Hira'], 'ja-Kana') }
            : !stop['ja-Hira'] &&
              stop['ja-Kana'] && { 'ja-Hira': translate(stop['ja-Kana'], 'ja-Hira') }
        )
      }),
      {}
    )

    companies[dir] = stops
  }

  return companies
}
