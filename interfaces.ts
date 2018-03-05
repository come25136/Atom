import { Inames } from './GTFS_loader/translation'

export interface Ierror extends Error {
  code?: number
}

export interface Ibus {
  route_num: number
  okayama_stop_time: string
  delay: number
  run: boolean
  license_number: number
  location: {
    lat: number
    lon: number
  }
  stops: {
    first: {
      name: Inames
      time: string
    }
    passing?: {
      name?: Inames
      time?: string
      pass_time?: string
    }
    next?: {
      name?: Inames
      time?: string
    }
    last: {
      name: Inames
      time: string
    }
  }
}