import { ScheduleRelationship } from './schedule'

export type StopTimeEvent = (
  | {
      delay: number
      time?: number
    }
  | {
      delay?: number
      time: number
    }) & { uncertainty?: number }

export type StopTimeUpdate = (
  | {
      stop_sequence: number
      stop_id?: string
    }
  | {
      stop_sequence?: number
      stop_id: string
    }
  | {
      stop_sequence: number
      stop_id: string
    }) &
  (
    | {
        arrival: StopTimeEvent
        departure?: StopTimeEvent
      }
    | {
        arrival?: StopTimeEvent
        departure: StopTimeEvent
      }
    | {
        arrival: StopTimeEvent
        departure: StopTimeEvent
      }
    | {
        arrival?: undefined
        departure?: undefined
      }) & {
    schedule_relationship?: ScheduleRelationship
  }
