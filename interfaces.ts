import { Inames } from './libs/gtfs_loader/translation'

export interface Ierror extends Error {
  code?: number
}

export interface busDate {
  schedule: string // 00:00
  pass?: string // 00:00
}

export interface stop {
  id: string // 固有id
  name: Inames
  location: {
    lat: number
    lon: number
  }
}

export interface broadcastStop extends stop {
  location: broadcastLocation
}

export interface broadcastBusStop extends broadcastStop {
  date: busDate
}

export interface broadcastLocation {
  latitude: number
  lat: number
  longitude: number
  lon: number
  lng: number
  long: number
}

export interface broadcastData {
  run: boolean
  license_number?: string
  rollsign?: string
  delay?: number
  route_num: string
  direction?: number // 方角(右回り 0~359)
  stations: string[]
  location?: broadcastLocation
  stops: {
    first: broadcastBusStop
    passing?: broadcastBusStop
    next?: broadcastBusStop
    last: broadcastBusStop
  }
}
