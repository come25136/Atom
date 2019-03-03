import { getAgency } from './agency'
import { getCalendarDates } from './calendar_dates'
import { getCalendars } from './calendar'
import { getRoutes } from './routes'
import { getShapes } from './shapes'
import { getStopTimes } from './stop_times'
import { getStops } from './stops'
import { getTranslations } from './translation'
import { getTrips } from './trips'

export * from './agency'
export * from './calendar_dates'
export * from './calendar'
export * from './routes'
export * from './shapes'
export * from './stop_times'
export * from './stops'
export * from './translation'
export * from './trips'

export async function loadGtfs() {
  return Promise.all([
    getAgency(),
    getCalendarDates(),
    getCalendars(),
    getRoutes(),
    getShapes(),
    getStopTimes(),
    getStops(),
    getTranslations(),
    getTrips()
  ])
}
