import { Translation } from './libs/gtfs/static'
import { RouteInfo } from './libs/route'

export interface StopDate {
  schedule: string // ISO 8601
}

export interface Location {
  lat: number
  lon: number
}

export interface Stop {
  id: string // 固有id
  name: Translation
  location: Location
}

export interface BroadcastLocation {
  latitude: number
  lat: number
  longitude: number
  lon: number
  lng: number
  long: number
}

export interface BroadcastStop extends Stop {
  location: BroadcastLocation
}

export interface BroadcastVehicleStop<passed extends boolean = false> extends BroadcastStop {
  date: passed extends true
    ? StopDate & {
        passed: string // ISO 8601
      }
    : StopDate
}

interface BroadcastBaseVehicle {
  run: boolean

  route: {
    id: RouteInfo['id']
  }
  stations: string[]
  stops: {
    first: BroadcastVehicleStop
    last: BroadcastVehicleStop
  }
}

export interface BroadcastNotRunVehicle extends BroadcastBaseVehicle {
  run: false
}

export interface BroadcastRunVehicle extends BroadcastBaseVehicle {
  run: true

  descriptors: {
    id: string | null
    label: string | null
    license_plate: string | null
  }
  headsign: string | null
  delay: number

  bearing: number // 方角(右回り 0~359)
  stations: string[]
  location: BroadcastLocation
  stops: {
    first: BroadcastVehicleStop
    passed: BroadcastVehicleStop<true>
    next: BroadcastVehicleStop
    last: BroadcastVehicleStop
  }
}

export type BroadcastVehicle = BroadcastNotRunVehicle | BroadcastRunVehicle

export interface EmitPositions {
  company_name: string
  buses: BroadcastVehicle[]
}
