import * as moment from 'moment'

import { h24ToLessH24 } from '../util'

import { Inames } from '../gtfs_loader/translation'

import { broadcastBusStop } from '../../interfaces'

export interface IbusRaw {
  routeNum: string
  run: string
  delay: number
  licenseNumber: number
  lat: number
  lon: number
}

export class createBus {
  private _startedAt: moment.Moment
  private _run: boolean // 運休の場合false
  private _delay: number
  private _licenseNumber: number // 車両番号(ナンバープレート)
  private _routeNum: string // 系統番号
  private _stations: broadcastBusStop[]
  private _route: broadcastBusStop[] // 路線
  private _location: {
    lat: number // 緯度(y)
    lon: number // 経度(x)
  }
  private _passing: broadcastBusStop
  private _nextIndex: number

  private getIndex(route: broadcastBusStop[], passing: Inames) {
    return route.findIndex(stop => (passing.ja === stop.name.ja ? true : false))
  }

  constructor(
    private _companyName: string,
    bus: IbusRaw,
    route: broadcastBusStop[],
    stations: string[],
    passing: {
      time: string
      name: Inames
    },
    private _standardDate: moment.Moment = moment()
  ) {
    this._startedAt = h24ToLessH24(route[0].date.schedule, _standardDate)
    this._run = bus.run === '運休' ? false : true
    this._delay = bus.delay
    this._licenseNumber = bus.licenseNumber
    this._routeNum = bus.routeNum
    this._stations = route.filter(stop => stations.includes(stop.id))
    this._route = route.map(stop =>
      Object.assign(stop, {
        date: { schedule: h24ToLessH24(stop.date.schedule, _standardDate).format() }
      })
    )
    this._location = {
      lat: bus.lat,
      lon: bus.lon
    }

    const passingIndex = this.getIndex(route, passing.name)
    this._passing = Object.assign({}, route[passingIndex], {
      date: {
        schedule: h24ToLessH24(route[passingIndex].date.schedule, _standardDate).format(),
        pass: h24ToLessH24(passing.time, _standardDate).format()
      }
    })
    this._nextIndex = passingIndex + 1
  }

  passing(passing: { time: string; name: Inames }) {
    const passingIndex = this.getIndex(this._route, passing.name)
    this._passing = Object.assign({}, this._route[passingIndex], {
      time: {
        ...this._route[passingIndex].date,
        pass: h24ToLessH24(passing.time, this._startedAt).format()
      }
    })
    this._nextIndex = passingIndex + 1
  }

  get companyName() {
    return this._companyName
  }

  get isRun() {
    return this._run
  }

  get standardDate() {
    return this._standardDate
  }

  get licenseNumber() {
    return this._licenseNumber
  }

  get delay() {
    return this._delay
  }

  get location() {
    return this._location
  }

  get stations() {
    return this._stations
  }

  get routeNumber() {
    return this._routeNum
  }

  get route() {
    return this._route
  }

  get firstStop() {
    return this._route[0]
  }

  get passingStop() {
    return this._passing
  }

  get nextStop() {
    return this._route[this._nextIndex]
  }

  get lastStop() {
    return this._route[this._route.length - 1]
  }
}
