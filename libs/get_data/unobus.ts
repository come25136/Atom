import * as createHttpError from 'http-errors'
import * as moment from 'moment'
import * as superagent from 'superagent'

import { rawToObject } from '../basumada'

import { LoopGetData } from './loop_get_data'

export class LoopUnoBus extends LoopGetData {
  private prevRaw: string = ''

  public get name(): string {
    return 'unobus'
  }

  async loop(): Promise<void> {
    if (moment().isBetween(moment('1:30', 'H:mm'), moment('6:30', 'H:mm'))) {
      this.nextLoop(moment('6:30', 'H:mm').diff(moment()))

      return
    }

    try {
      const getResponse = await superagent.get('http://www3.unobus.co.jp/GPS/unobus.txt')

      if (getResponse.status !== 200)
        throw createHttpError(getResponse.status, 'The response code is not 200.')

      const { change, buses, generatedDate, raw } = await rawToObject(
        this.name,
        getResponse.text,
        this.prevRaw
      )

      const awaitTime =
        this.averageChangeTime !== null &&
        3000 <= this.averageChangeTime &&
        this.averageChangeTime <= 10000
          ? this.averageChangeTime
          : 3000 // 過度なアクセスをすると怒られる

      if (Object.keys(buses).length === 0) {
        if (this.prev.data.vehicles.length !== 0) this.updateData([], generatedDate)

        this.nextLoop(6000)

        return
      }

      // 起動直後は必ずtrueになる
      if (change) {
        this.save(raw, 'txt', generatedDate)

        this.prevRaw = raw

        this.addChangeTime(this.prev.date ? generatedDate.diff(this.prev.date) : awaitTime)
        this.updateData(buses, generatedDate)

        buses.splice(0, buses.length)
      }

      process.env.NODE_ENV !== 'production' &&
        console.log(
          `${this.name}: It gets the data after ${awaitTime / 1000} seconds. ${
            this.averageChangeTime
          }`
        )

      this.nextLoop(awaitTime)
    } catch (err) {
      console.warn(err)
      this.nextLoop(1000)
    }
  }
}
