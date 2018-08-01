import * as util from 'util'
import { h24ToLessH24 } from './util'

import * as csvParse from 'csv-parse'

import * as moment from 'moment'

import { bus, createBus } from './classes/create_bus'

import { Ierror } from '../interfaces'

export interface basumadaRaw {
  routeNum: string
  okayamaStopTime: string
  delay: number
  run: string
  passingStop: string
  licenseNumber: string
  lat: string
  lon: string
  firstStop: string
  finalStop: string
}

export interface basumada {
  change: boolean
  buses: { [k: string]: bus }
  date: moment.Moment
  raw: string
}

const csvParser = util.promisify<string, csvParse.Options, basumadaRaw[]>(csvParse)

export async function rawToObject(
  companyName: string,
  rawData: string,
  comparisonRawData?: string,
  _date?: moment.Moment
): Promise<basumada> {
  if (!/\/\/LAST/.test(rawData)) {
    const error: Ierror = new Error('Server side processing is not completed.')
    error.code = 202
    throw error
  }

  const date = _date ? _date : h24ToLessH24(rawData.substr(0, 8)),
    busesRaw: basumadaRaw[] = await csvParser(rawData.substr(11), {
      columns: [
        'routeNum',
        'okayamaStopTime',
        'delay',
        'run',
        'passingStop',
        'licenseNumber',
        'lat',
        'lon',
        'firstStop',
        'finalStop'
      ],
      comment: '//'
    })

  const buses: { [k: string]: bus } = {}

  for (const busRaw of busesRaw) {
    if (busRaw.passingStop.substr(13, 3) === '《着》') continue

    const bus = await createBus(
      companyName,
      busRaw.run === '運休' ? false : true,
      Number(busRaw.delay),
      busRaw.routeNum,
      {
        lat: Number(busRaw.lat),
        lon: Number(busRaw.lon)
      },
      busRaw.firstStop.substr(3, 5),
      busRaw.passingStop.substr(13),
      busRaw.passingStop.substr(6, 5),
      h24ToLessH24(rawData.substr(0, 8), date),
      busRaw.licenseNumber
    )

    buses[`${bus.routeNumber}_${bus.licenseNumber}`] = bus
  }

  return {
    change:
      comparisonRawData &&
      comparisonRawData.substr(9).replace(/.+《着》.+\n/, '') ===
        rawData.substr(9).replace(/.+《着》.+\n/, '')
        ? false
        : true,
    buses,
    date,
    raw: rawData
  }
}
