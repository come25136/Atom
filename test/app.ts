import { readdir, readFileSync, writeFileSync } from 'fs'

import * as moment from 'moment'

import { basumada, rawToObject } from '../libs/basumada'
import { createBusToBroadcastObject } from '../libs/util'

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

const path = './test/test_data/'

readdir(path, async (err, files) => {
  if (err) throw err

  let cache: {
    date: {
      latest: moment.Moment
      diff?: number
    }
    data: {
      raw: string
      buses?: basumada['buses']
    }
  }

  console.time('/libs/unobus.ts')

  const data: basumada[] = []

  for (const file of files) {
    data.push(
      await rawToObject(
        'unobus',
        readFileSync(path + file, { encoding: 'utf-8' }),
        undefined,
        moment(file.split('.')[0], 'YYYY-MM-DD hh-mm-ss')
      ).catch(err => {
        console.log(file)
        throw err
      })
    )
  }

  console.timeEnd('/libs/unobus.ts')
  console.log('Data analytics completed.')
  console.log('Test start.')
  let errFlag = false

  const result = await Promise.all(
    data.map(async data => {
      if (!data || !data.buses) {
        errFlag = true
        if (process.argv[2] === 'true') return data
      }

      return await Promise.all(Object.values(data.buses).map(bus => createBusToBroadcastObject(bus)))
    })
  )

  errFlag ? console.log('An error occurred. Please check the log.') : console.log('unobus.ts test success.')

  if (process.argv[2] === 'true') {
    const fileName = `${moment().format('YYYY-MM-DD HH-mm-ss')}.log`,
      filePath = `./test/result/${fileName}`

    console.log(`The test result is saving in ${fileName}.`)

    writeFileSync(filePath, JSON.stringify(result))
  }
})
