import { ScheduleRelationship } from './schedule'
import { StopTimeUpdate } from './stop'
import { VehicleDescriptor } from './vehicle'

export interface TripUpdate {
  trip: TripDescriptor
  vehicle?: VehicleDescriptor
  stop_time_update: StopTimeUpdate[] | undefined
  timestamp?: number
  delay?: number
}

export type TripDescriptor = (
  | {
      trip_id: string
      route_id?: string
      direction_id?: string
      start_time?: string
      start_date?: string
    }
  | {
      trip_id?: string
      route_id: string
      direction_id: string
      start_time: string
      start_date: string
    }
) & {
  schedule_relationship?: ScheduleRelationship
}
