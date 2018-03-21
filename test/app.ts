import { readdir, readFile, appendFileSync } from 'fs'

import * as csvParse from 'csv-parse'

import * as moment from 'moment'

import * as unobus from '../libs/unobus'

import { Ibus } from '../interfaces'

interface IbusRaw {
  route_num: number
  okayama_stop_time: string
  delay: number
  run: string
  passing_stop: string
  license_number: number
  lat: number
  lon: number
  first_stop: string
  final_stop: string
}

const path = './raw_data/'

function readData(path: string) {
  return new Promise<string>((resolve, reject) =>
    readFile(
      path,
      (err, data) => (err ? reject(err) : resolve(data.toString()))
    )
  )
}

function csv(data: string) {
  return new Promise<string[]>(resolve =>
    csvParse(
      data.substr(11),
      {
        columns: [
          'route_num',
          'okayama_stop_time',
          'delay',
          'run',
          'passing_stop',
          'license_number',
          'lat',
          'lon',
          'first_stop',
          'final_stop'
        ],
        comment: '//'
      },
      (err: Error, busesRaw: IbusRaw[]) =>
        // resolve(busesRaw.map(bus => bus.first_stop.substr(9))))
        resolve(busesRaw.map(bus => bus.passing_stop.substr(13)))
    )
  )
}

readdir(path, async (err, files) => {
  if (err) throw err

  console.time('/libs/unobus.ts')

  const data = await Promise.all(
    files.map(async filePath =>
      unobus
        .get(
          await readData(path + filePath),
          moment(filePath.split('.')[0], 'YYYY-MM-DD hh-mm-ss').toISOString()
        )
        .catch(err => console.log(filePath))
    )
  )

  console.log('Data analysis completed.')

  const fileName = `./test/result/${moment().format('YYYY-MM-DD HH-mm-ss')}.log`

  let errFlag = false

  data.forEach(unobus => {
    if (!unobus || !unobus.buses) {
      errFlag = true
      if (process.argv[2] === 'true') appendFileSync(fileName, data, 'utf-8')
      return
    }

    if (process.argv[2] === 'true')
      appendFileSync(
        fileName,
        JSON.stringify([...unobus.buses.values()]) + '\n',
        'utf-8'
      )
  })

  console.timeEnd('/libs/unobus.ts')

  errFlag
    ? console.log('An error occurred. Please check the log.')
    : console.log('unobus.ts test success.')
  console.log()
})
