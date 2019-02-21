import * as csvParse from 'csv-parse'
import * as createHttpError from 'http-errors'
import * as moment from 'moment'
import * as util from 'util'

import { createVehicle, Vehicle } from './classes/create_vehicle'
import { h24ToLessH24 } from './util'

export interface BasumadaRaw {
  routeId: string
  okayamaStationStopTime: string | ''
  delay: string
  isRun: ''
  passingStop: string
  licensePlate: string
  lat: string
  lon: string
  firstStop: string
  finalStop: string
}

export interface BasumadaRawNoOperation {
  routeId: string
  okayamaStationStopTime: ''
  delay: '0'
  isRun: '運休'
  passingStop: ''
  licensePlate: ''
  lat: ''
  lon: ''
  firstStop: string
  finalStop: string
}

export interface Basumada {
  change: boolean
  buses: Vehicle[]
  generatedDate: moment.Moment
  raw: string
}

const csvParser = util.promisify<string, csvParse.Options, BasumadaRaw[]>(csvParse)

const unobusVehicleWithOutlet: string[] = [
  '1486',
  '1525',
  '1584',
  '1585',
  '1613',
  '1614',
  '1615',
  '1616',
  '1617',
  '1618',
  '1619',
  '1620',
  '1658',
  '1659',
  '1660',
  '1661',
  '1662',
  '1663'
]

export async function rawToObject(
  companyName: string,
  rawData: string,
  comparisonRawData?: string,
  standardDate?: moment.Moment
): Promise<Basumada> {
  if (!/\/\/LAST/.test(rawData))
    throw createHttpError(202, 'Server side processing is not completed.')

  const busesRaw: (BasumadaRaw | BasumadaRawNoOperation)[] = await csvParser(rawData.substr(11), {
    columns: [
      'routeId',
      'okayamaStationStopTime',
      'delay',
      'isRun',
      'passingStop',
      'licensePlate',
      'lat',
      'lon',
      'firstStop',
      'finalStop'
    ],
    comment: '//'
  })

  const buses: Vehicle[] = []

  for (const busRaw of busesRaw) {
    if (busRaw.passingStop.substr(13, 3) === '《着》') continue

    const startDate = h24ToLessH24(
      busRaw.firstStop.substr(3, 5),
      h24ToLessH24(busRaw.passingStop.substr(6, 5), standardDate, true, true)
    )

    const bus = await (busRaw.isRun === '運休'
      ? createVehicle(companyName, busRaw.routeId, startDate)
      : createVehicle(companyName, busRaw.routeId, startDate, {
          secondsDelay: Number(busRaw.delay) * 60,
          location: {
            lat: Number(busRaw.lat),
            lon: Number(busRaw.lon)
          },
          currentStop: {
            sequence: busRaw.passingStop.substr(13),
            passedDate: h24ToLessH24(busRaw.passingStop.substr(6, 5), startDate)
          },
          descriptors: {
            licensePlate: busRaw.licensePlate,
            expansion: {
              electricalOutlet: unobusVehicleWithOutlet.includes(busRaw.licensePlate) ? [100] : []
            }
          }
        }))

    buses.push(bus)
  }

  return {
    change:
      (comparisonRawData && comparisonRawData.substr(11).replace(/.+《着》.+\n/, '')) !==
      rawData.substr(11).replace(/.+《着》.+\n/, ''),
    buses,
    generatedDate: h24ToLessH24(rawData.substr(1, 8), standardDate),
    raw: rawData
  }
}
