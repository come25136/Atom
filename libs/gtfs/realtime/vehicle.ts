import { CongestionLevel } from './congestion'
import { OccupancyStatus } from './occupancy'
import { Position } from './position'
import { TripDescriptor } from './trip'

export interface VehiclePosition {
  trip?: TripDescriptor
  vehicle?: VehicleDescriptor
  position?: Position
  current_stop_sequence?: number
  stop_id?: string
  current_status?: VehicleStopStatus
  timestamp?: number
  congestion_level?: CongestionLevel
  occupancy_status?: OccupancyStatus
}

export enum VehicleStopStatus {
  INCOMING_AT,
  STOPPED_AT,
  IN_TRANSIT_TO
}

export interface VehicleDescriptor {
  id?: string
  label?: string
  license_plate?: string
}
