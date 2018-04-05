import { createReadStream } from 'fs'

import * as csvParser from 'csv-parse'

export interface Itranslation {
  trans_id: string
  lang: string
  translation: string
}

export interface Inames {
  ja: string
  'ja-Hrkt': string
  en?: string
}

export default new Promise<{ [k: string]: Inames }>(resolve => {
  const stops: { [k: string]: Inames } = {}

  createReadStream('./GTFS/translations.txt').pipe(
    csvParser({ columns: true }, (err: Error, data: Itranslation[]) => {
      data.forEach(
        stop =>
          (stops[stop.trans_id] = Object.assign(
            { ja: '', 'ja-Hrkt': '', en: undefined },
            stops[stop.trans_id],
            { [stop.lang]: stop.translation }
          ))
      )

      resolve(stops)
    })
  )
})
