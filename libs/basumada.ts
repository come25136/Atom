import * as util from 'util'
import { h24ToLessH24 } from './util'

import * as csvParse from 'csv-parse'

import * as moment from 'moment'

import translations from './gtfs_loader/translation'

import stations from './station_loader'

import route from '../libs/route'

import { createBus } from './classes/create_bus'

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
  buses: { [k: string]: createBus }
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

  const buses: { [k: string]: createBus } = {}

  for (const busRaw of busesRaw) {
    if (busRaw.passingStop.substr(13, 3) === '《着》') break

    const bus = new createBus(
      companyName,
      {
        routeNum: busRaw.routeNum,
        run: busRaw.run,
        delay: Number(busRaw.delay),
        licenseNumber: busRaw.licenseNumber,
        lat: Number(busRaw.lat),
        lon: Number(busRaw.lon)
      },
      (await route(
        companyName,
        busRaw.routeNum,
        h24ToLessH24(busRaw.firstStop.substr(3, 5), date)
      ))[0],
      (await stations()).unobus,
      {
        time: busRaw.passingStop.substr(6, 5),
        name: (await translations())[companyName][busRaw.passingStop.substr(13)]
      },
      h24ToLessH24(rawData.substr(0, 8), date)
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
