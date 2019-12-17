import { Alert } from './alert'
import { Incrementality } from './incrementality'
import { TripUpdate } from './trip'
import { VehiclePosition } from './vehicle'

export interface FeedMessage {
  entity?: ({
    id: string
    is_deleted?: boolean
  } & (
    | {
        trip_update: TripUpdate
        vehicle?: VehiclePosition
        alert?: Alert
      }
    | {
        trip_update?: TripUpdate
        vehicle: VehiclePosition
        alert?: Alert
      }
    | {
        trip_update?: TripUpdate
        vehicle?: VehiclePosition
        alert: Alert
      }
    | {
        trip_update: TripUpdate
        vehicle: VehiclePosition
        alert?: Alert
      }
    | {
        trip_update?: TripUpdate
        vehicle: VehiclePosition
        alert: Alert
      }
    | {
        trip_update: TripUpdate
        vehicle?: VehiclePosition
        alert: Alert
      }
    | {
        trip_update: TripUpdate
        vehicle: VehiclePosition
        alert: Alert
      }
  ))[]
  header: FeedHeader
}

export interface FeedHeader {
  gtfs_realtime_version: string | '1.0'
  incrementality: Incrementality
  timestamp: number
}
