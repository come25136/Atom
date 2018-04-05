import { Inames } from './libs/gtfs_loader/translation'

export interface Ierror extends Error {
  code?: number
}

export interface Istop {
  id: string // 固有id
  name: Inames
  location: {
    lat: number // 緯度
    lon: number // 経度
  }
  time: {
    schedule: string // 00:00
    pass?: string // 00:00
  }
}

export interface broadcastLocation {
  latitude: number
  lat: number
  longitude: number
  lon: number
  lng: number
  long: number
}

export interface broadcastStop extends Istop {
  location: broadcastLocation
}

export interface broadcastData {
  run: boolean
  license_number?: number
  delay?: number
  route_num: number
  direction?: number // 方角(右回り 0~359)
  stations: broadcastStop[]
  location?: broadcastLocation
  stops: {
    first: string
    passing?: string
    next?: string
    last: string
  }
}
