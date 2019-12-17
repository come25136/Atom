import { TripDescriptor } from './trip'

export type EntitySelector =
  | ({
      agency_id?: string
      route_id?: string
      route_type?: number
      trip?: TripDescriptor
      stop_id?: string
    } & { agency_id: string })
  | { route_id: string }
  | { route_type: number }
  | { trip: TripDescriptor }
  | { stop_id: string }
