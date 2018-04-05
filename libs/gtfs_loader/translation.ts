import { readdir, createReadStream } from 'fs'

import * as csvParser from 'csv-parse'

import { getDataDir } from '../util'

export interface Itranslation {
  trans_id: string
  lang: string
  translation: string
}

export interface Inames {
  ja: string
  'ja-Hira': string
  en?: string
}

interface Itranslations {
  [k: string]: {
    [k: string]: Inames
  }
}

export default new Promise<Itranslations>(resolve => {
  console.log(getDataDir)
  readdir(getDataDir(), async (err, dires) => {
    const companies: Itranslations = {}

    for (let i = 0; i < dires.length; i++) {
      companies[dires[i]] = await new Promise<{ [k: string]: Inames }>(resolve => {
        const stops: { [k: string]: Inames } = {}

        createReadStream(`${getDataDir()}/${dires[i]}/gtfs/expansion/translations.txt`).pipe(
          csvParser({ columns: true }, (err: Error, data: Itranslation[]) => {
            data.forEach(
              stop =>
                (stops[stop.trans_id] = Object.assign(
                  { ja: '', 'ja-Hira': '', en: undefined },
                  stops[stop.trans_id],
                  { [stop.lang]: stop.translation }
                ))
            )

            resolve(stops)
          })
        )
      })
    }

    resolve(companies)
  })
})
