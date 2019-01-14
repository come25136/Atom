import { Translation } from './libs/gtfs/static'
import { RouteInfo } from './libs/route'

export interface StopDate {
  schedule: string // ISO 8601
}

export interface Stop {
  id: string // 固有id
  name: Translation
  location: {
    lat: number
    lon: number
  }
}

export interface BroadcastStop extends Stop {
  location: BroadcastLocation
}

export interface BroadcastBusStop<passed extends boolean = false> extends BroadcastStop {
  date: passed extends true
    ? StopDate & {
        passed: string // ISO 8601
      }
    : StopDate
}

export interface BroadcastLocation {
  latitude: number
  lat: number
  longitude: number
  lon: number
  lng: number
  long: number
}

interface BroadcastBaseBus {
  run: boolean

  route: {
    id: RouteInfo['id']
  }
  stations: string[]
  stops: {
    first: BroadcastBusStop
    last: BroadcastBusStop
  }
}

export interface BroadcastNotRunBus extends BroadcastBaseBus {
  run: false
}

export interface BroadcastRunBus extends BroadcastBaseBus {
  run: true

  descriptors: {
    id: string | null
    label: string | null
    license_plate: string | null
  }
  headsign: string | null
  delay: number

  direction: number // 方角(右回り 0~359)
  stations: string[]
  location: BroadcastLocation
  stops: {
    first: BroadcastBusStop
    passed: BroadcastBusStop<true>
    next: BroadcastBusStop
    last: BroadcastBusStop
  }
}

export type BroadcastBus = BroadcastNotRunBus | BroadcastRunBus

export interface EmitPositions {
  company_name: string
  buses: BroadcastBus[]
}
