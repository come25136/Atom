import * as csvParse from 'csv-parse'
import * as fs from 'fs'
import { promisify } from 'util'

import { getDataDir, translate } from '../../util'

interface GtfsTranslation {
  trans_id: string
  lang: string
  translation: string
}

export interface Translation {
  ja: string
  'ja-Hira': string
  'ja-Kana': string
  en: string | null
}

export type getTranslations = {
  [companyName: string]: {
    [transId: string]: Translation
  }
}

const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const csvParser = promisify<string, csvParse.Options, GtfsTranslation[]>(csvParse)

const companies: getTranslations = {}

export async function getTranslations(): Promise<getTranslations> {
  if (Object.keys(companies).length) return companies

  const dirs = await readDir(getDataDir())

  for (let dir of dirs) {
    if (fs.statSync(`${getDataDir()}/${dir}`).isDirectory() === false) continue

    const rows = await csvParser(
      await readFile(`${getDataDir()}/${dir}/gtfs/translations.txt`, 'utf8'),
      {
        columns: true
      }
    )

    let stops: { [trans_id: string]: Translation } = {}

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
            en: stop.en || null,
            ja: stop.ja.replace(/[Ａ-Ｚａ-ｚ０-９]/g, char =>
              String.fromCharCode(char.charCodeAt(0) - 0xfee0)
            )
          },
          stop['ja-Hira'] !== undefined && stop['ja-Kana'] === undefined
            ? { 'ja-Kana': translate(stop['ja-Hira'], 'ja-Kana') }
            : stop['ja-Hira'] === undefined &&
                stop['ja-Kana'] !== undefined && {
                  'ja-Hira': translate(stop['ja-Kana'], 'ja-Hira')
                }
        )
      }),
      {}
    )

    companies[dir] = stops
  }

  return companies
}
