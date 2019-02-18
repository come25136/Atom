import * as createHttpError from 'http-errors'
import * as moment from 'moment'
import * as superagent from 'superagent'

import { rawToObject } from '../basumada'

import { LoopGetData } from './loop_get_data'

export class LoopUnoBus extends LoopGetData {
  private _prevRaw: string = ''

  public get name(): string {
    return 'unobus'
  }

  async loop(): Promise<void> {
    if (moment().isBetween(moment('1:30', 'H:mm'), moment('6:30', 'H:mm'))) {
      this.nextLoop(this.loop, moment('6:30', 'H:mm').diff(moment()))

      return
    }

    try {
      const getResponse = await superagent.get('http://www3.unobus.co.jp/GPS/unobus.txt')

      if (getResponse.status !== 200)
        throw createHttpError(getResponse.status, 'The response code is not 200.')

      const { change, buses, generatedDate, raw } = await rawToObject(
        this.name,
        getResponse.text,
        this._prevRaw
      )

      const prevDiffTime: number | null = this._prev.date
        ? this._prev.date
            .clone()
            .add(
              this._changeTimes.reduce((prev, current) => prev + current) /
                this._changeTimes.length,
              'ms'
            )
            .diff(moment())
        : null

      const awaitTime =
        prevDiffTime !== null && 3000 <= prevDiffTime && prevDiffTime <= 10000 ? prevDiffTime : 3000 // 過度なアクセスをすると怒られる

      if (Object.keys(buses).length === 0) {
        if (this._prev.data.vehicles.length !== 0) this.updateData([], generatedDate)

        this.nextLoop(this.loop, 6000)

        return
      }

      // 起動直後は必ずtrueになる
      if (change) {
        this.save(raw, 'txt', generatedDate)

        this._prevRaw = raw
        this.updateData(buses, generatedDate)
      }

      this._changeTimes.push(this._prev.date ? moment().diff(this._prev.date) : awaitTime)
      if (10 < this._changeTimes.length) this._changeTimes.shift()

      process.env.NODE_ENV !== 'production' &&
        console.log(
          `${this.name}: It gets the data after ${awaitTime / 1000} seconds. ${prevDiffTime}`
        )

      this.nextLoop(this.loop, awaitTime)
    } catch (err) {
      console.warn(err)
      this.nextLoop(this.loop, 1000)
    }
  }
}
