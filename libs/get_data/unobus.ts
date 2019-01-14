import { writeFile } from 'fs'
import * as createHttpError from 'http-errors'
import * as moment from 'moment'
import { Server } from 'socket.io'
import * as superagent from 'superagent'

import { BroadcastBus } from '../../interfaces'
import { rawToObject } from '../basumada'
import { createBusToBroadcastBus, ioEmitBus } from '../util'

export class UnoBusLoop {
  private _loopTimer: NodeJS.Timer | null = null

  private _changeTimes: number[] = []

  private _prev: {
    date: moment.Moment | null
    data: {
      raw: string
      broadcastBuses: BroadcastBus[]
    }
  } = {
    date: null,
    data: {
      raw: '',
      broadcastBuses: []
    }
  }

  private async getBusLoop(): Promise<void> {
    if (moment().isBetween(moment('1:30', 'H:mm'), moment('6:30', 'H:mm'))) {
      setTimeout(this.getBusLoop.bind(this), moment('6:30', 'H:mm').diff(moment()))

      return
    }

    try {
      const getResponse = await superagent.get('http://www3.unobus.co.jp/GPS/unobus.txt')

      if (getResponse.status !== 200)
        throw createHttpError(getResponse.status, 'The response code is not 200.')

      const { change, buses, generatedDate, raw } = await rawToObject(
        this.name,
        getResponse.text,
        this._prev.data.raw
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

      if (this._prev.data.broadcastBuses.length !== 0 && Object.keys(buses).length === 0)
        ioEmitBus(this.io, this.name, (this._prev.data.broadcastBuses = []))
      if (Object.keys(buses).length === 0) {
        setTimeout(this.getBusLoop.bind(this), 6000)

        return
      }

      // 起動直後は必ずtrueになる
      if (change) {
        if (process.env.RAW_SAVE === 'true')
          writeFile(
            `./raw_data/${this.name}/${generatedDate.format('YYYY-MM-DD HH-mm-ss')}.txt`,
            raw,
            err => (err ? console.error(err) : null)
          )

        process.env.NODE_ENV !== 'production' && console.log(`${this.name}: Bus update!!`)

        const broadcastBuses = await Promise.all(
          Object.values(buses).map(async bus => createBusToBroadcastBus(bus))
        )

        ioEmitBus(this.io, this.name, broadcastBuses)

        this._prev.date = generatedDate
        this._prev.data.raw = raw
        this._prev.data.broadcastBuses = broadcastBuses
      }

      this._changeTimes.push(this._prev.date ? moment().diff(this._prev.date) : awaitTime)
      if (10 < this._changeTimes.length) this._changeTimes.shift()

      process.env.NODE_ENV !== 'production' &&
        console.log(
          `${this.name}: It gets the data after ${awaitTime / 1000} seconds. ${prevDiffTime}`
        )

      setTimeout(this.getBusLoop.bind(this), awaitTime)
    } catch (err) {
      console.warn(err)
      setTimeout(this.getBusLoop.bind(this), 1000)
    }
  }

  constructor(private io: Server) {
    this.loopStart()
  }
  public get name(): string {
    return 'unobus'
  }

  public get buses(): BroadcastBus[] {
    return this._prev.data.broadcastBuses
  }

  public loopStart(): void {
    this.getBusLoop()
  }

  public get loopStatus(): boolean {
    return this._loopTimer !== null
  }

  public loopStop(): void {
    if (this._loopTimer) {
      clearTimeout(this._loopTimer)
      this._loopTimer = null
    }
  }
}
