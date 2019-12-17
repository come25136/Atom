import * as createHttpError from 'http-errors'

import { ScheduleRelationship } from './schedule'

export type StopTimeEvent = (
  | {
      delay: number
      time?: number
    }
  | {
      delay?: number
      time: number
    }
) & { uncertainty?: number }

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
    }
) &
  (
    | ((
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
      ) & {
        schedule_relationship?: ScheduleRelationship.SCHEDULED | ScheduleRelationship.SKIPPED
      })
    | {
        arrival: undefined
        departure: undefined
        schedule_relationship: ScheduleRelationship.NO_DATA
      }
  )
