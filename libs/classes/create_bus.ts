import * as moment from 'moment'

import { h24ToLessH24, locationToBroadcastLocation } from '../util'

import { Istop } from '../gtfs_loader/stop_times'
import stations from '../station_loader'
import translations from '../gtfs_loader/translation'

import { broadcastBusStop, stop } from '../../interfaces'
import { route as _route } from '../route'

export interface IbusRaw {
  routeNum: string
  run: string
  delay: number
  licenseNumber: string
  lat: number
  lon: number
}

export class bus {
  private _startDate: moment.Moment
  private _run: boolean // 運休の場合false
  private _delay: number
  private _licenseNumber?: string // 車両番号(ナンバープレート)
  private _routeNum: string // 系統番号
  private _stations: stop[]
  private _route: _route[] // 路線
  private _location: {
    lat: number // 緯度(y)
    lon: number // 経度(x)
  }
  private _passing: broadcastBusStop
  private _nextIndex: number

  constructor(
    private _companyName: string,
    bus: {
      isRun: boolean
      licenseNum?: string
      delay: number
      routeNum: string
      location: { lat: number; lon: number }
      currentStopPassingTime?: moment.Moment
    },
    route: _route[],
    stations: string[],
    currentStopSequence: Istop['stop_sequence'],
    _standardDate: moment.Moment = moment()
  ) {
    this._startDate = h24ToLessH24(route[0].date.schedule, _standardDate)
    this._run = bus.isRun
    this._delay = bus.delay
    this._licenseNumber = bus.licenseNum
    this._routeNum = bus.routeNum
    this._stations = route.filter(stop => stations.includes(stop.id))
    this._route = route.map(stop =>
      Object.assign({}, stop, {
        date: { schedule: h24ToLessH24(stop.date.schedule, _standardDate).format() }
      })
    )
    this._location = bus.location

    const passingIndex = route.findIndex(
      stop => (stop.stop_sequence === currentStopSequence ? true : false)
    )
    this._passing = Object.assign({}, this._route[passingIndex], {
      location: locationToBroadcastLocation(route[passingIndex].location),
      date: {
        ...this._route[passingIndex].date,
        pass: bus.currentStopPassingTime
          ? bus.currentStopPassingTime.format()
          : moment(this._route[passingIndex].date.schedule)
              .add(this.delay, 's')
              .format()
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

  get startDate() {
    return this._startDate
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

export async function createBus(
  companyName: string,
  isRun: boolean,
  delay: number,
  routeNum: string,
  location: { lat: number; lon: number },
  firstStopTime: moment.Moment,
  _currentStopSequence: Istop['stop_sequence'] | string,
  standardDate: moment.Moment,
  currentStopPassingTime?: moment.Moment,
  licenseNum?: string
) {
  const route = (await _route(companyName, routeNum, firstStopTime))[0]

  const currentStopSequence =
    typeof _currentStopSequence === 'string'
      ? await translations().then(data =>
          route.find(({ name }) => name.ja === data[companyName][_currentStopSequence].ja)
        )
      : _currentStopSequence

  if (!currentStopSequence) return Promise.reject('unko')

  return new bus(
    companyName,
    {
      routeNum,
      isRun,
      delay,
      licenseNum,
      location,
      currentStopPassingTime
    },
    route,
    (await stations())[companyName],
    typeof currentStopSequence !== 'number'
      ? currentStopSequence.stop_sequence
      : currentStopSequence,
    standardDate
  )
}
