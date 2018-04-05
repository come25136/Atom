import * as moment from 'moment'

import { h24ToLessH24 } from '../util'

import { Inames } from '../gtfs_loader/translation'

import { Istop } from '../../interfaces'

export interface IbusRaw {
  routeNum: number
  okayamaStopTime: string
  delay: number
  run: string
  passingStop: string
  licenseNumber: number
  lat: number
  lon: number
  firstStop: string
  finalStop: string
}

export class createBus {
  private _startedat: moment.Moment
  private _updatedAt: moment.Moment
  private _run: boolean // 運休の場合false
  private _delay: number
  private _licenseNumber: number // 車両番号(ナンバープレート)
  private _routeNum: number // 系統番号
  private _stations: Istop[]
  private _route: Istop[] // 路線
  private _location: {
    lat: number // 緯度(y)
    lon: number // 経度(x)
  }
  private _passing: Istop
  private _nextIndex: number

  private getIndex(route: Istop[], passing: Inames) {
    return route.findIndex(stop => (passing.ja === stop.name.ja ? true : false))
  }

  constructor(
    bus: IbusRaw,
    route: Istop[],
    passing: { time: string; name: Inames },
    updateTime?: string,
    standardDate: moment.Moment = moment()
  ) {
    this._startedat = h24ToLessH24(route[0].time.schedule, standardDate)
    this._updatedAt = updateTime ? h24ToLessH24(updateTime) : moment()
    this._run = bus.run === '運休' ? false : true
    this._delay = bus.delay
    this._licenseNumber = bus.licenseNumber
    this._routeNum = bus.routeNum
    this._stations = [
      {
        id: '320_04',
        name: { ja: '法界院駅前', 'ja-Hira': 'ほうかいいんえきまえ' },
        time: {
          schedule: '23:43:00'
        },
        location: { lat: 34.685329, lon: 133.92838 }
      }
    ] // route.map(station => h24ToLessH24(station.tim, standardDate)) // TODO ルートから検索するように変更
    this._route = route
    this._location = {
      lat: bus.lat,
      lon: bus.lon
    }

    const passingIndex = this.getIndex(route, passing.name)
    this._passing = Object.assign({}, route[passingIndex], {
      time: {
        schedule: route[passingIndex].time.schedule,
        pass: h24ToLessH24(passing.time, standardDate).format()
      }
    })
    this._nextIndex = passingIndex + 1
  }

  public setPassing(
    passing: { time: string; name: Inames },
    updateTime?: string
  ) {
    this._updatedAt = updateTime ? h24ToLessH24(updateTime) : moment()

    const passingIndex = this.getIndex(this._route, passing.name)
    this._passing = Object.assign({}, this._route[passingIndex], {
      time: {
        ...this._route[passingIndex].time,
        pass: h24ToLessH24(passing.time, this._startedat).format()
      }
    })
    this._nextIndex = passingIndex + 1
  }

  public get isRun() {
    return this._run
  }

  public get licenseNumber() {
    return this._licenseNumber
  }

  public get delay() {
    return this._delay
  }

  public get location() {
    return this._location
  }

  public get stations() {
    return this._stations
  }

  public get routeNumber() {
    return this._routeNum
  }

  public get route() {
    return this._route
  }

  public get firstStop() {
    return this._route[0]
  }

  public get passingStop() {
    return this._passing
  }

  public get nextStop() {
    return this._route[this._nextIndex]
  }

  public get lastStop() {
    return this._route[this._route.length - 1]
  }
}
