import { createReadStream } from 'fs'

import * as csvParser from 'csv-parse'

interface Itranslation {
  trans_id: string
  lang: string
  translation: string
}

export interface Inames {
  ja: string
  'ja-Hrkt': string
  en: string
}

export default new Promise<Map<string, Inames>>(resolve => {
  const stops = new Map<string, Inames>()

  createReadStream('./GTFS/translations.txt')
    .pipe(csvParser({ columns: true }, (err: Error, data: Itranslation[]) => {
      data.forEach(stop =>
        stops.set(stop.trans_id, Object.assign({ ja: '', 'ja-Hrkt': '', en: '' }, stops.get(stop.trans_id), { [stop.lang]: stop.translation }))
      )

      resolve(stops)
    }))
})
