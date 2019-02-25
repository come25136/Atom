import * as createHttpError from 'http-errors'
import * as moment from 'moment'

import { Location, Stop, StopDate } from '../interfaces'

import {
  getRoutes,
  getShapes as getGtfsShapes,
  getStops,
  getStopTimes,
  getTranslations,
  getTrips,
  GtfsStopTime,
  GtfsTrip
} from './gtfs/static'
import { dateToServiceIds } from './gtfs/util'
import { h24ToLessH24 } from './util'

export interface RouteInfo {
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
  id: string
  name: {
    short: string
    long: string
  }
  description: string | null
  color: string | null
  text: {
    color: string | null
  }
}

export interface RouteStop extends Stop {
  sequence: GtfsStopTime['stop_sequence']
  date: StopDate
  headsign: GtfsTrip['trip_headsign']
  direction: GtfsTrip['direction_id']
}

export interface GetShapes {
  id: string
  coordinates: {
    location: Location
    distTraveled?: number
  }[]
}

export async function getRouteInfo(companyName: string, routeId: string): Promise<RouteInfo> {
  const routes = await getRoutes()

  if (routes[companyName] === undefined) throw createHttpError(404, 'There is no such company.')

  if (routes[companyName][routeId] === undefined)
    throw createHttpError(404, 'There is no such route.')

  const route = routes[companyName][routeId]

  return {
    type: route.route_type,
    id: route.route_id,
    name: {
      short: route.route_short_name,
      long: route.route_long_name
    },
    description: route.route_desc,
    color: route.route_color,
    text: {
      color: route.route_text_color
    }
  }
}

export async function getRoutesStops(
  companyName: string,
  routeId: string,
  firstStopDate: moment.Moment = moment(),
  dayOnly: boolean = false
): Promise<RouteStop[][]> {
  const [stopTimes, stops, translations, _trips] = await Promise.all([
    getStopTimes(),
    getStops(),
    getTranslations(),
    getTrips()
  ])

  const trips: GtfsTrip[] = await dateToServiceIds(companyName, firstStopDate).then(days =>
    Object.values(_trips[companyName][routeId] || []).filter(
      trip =>
        (days.includes(trip.service_id) && dayOnly) ||
        firstStopDate.format('HH:mm:ss') === stopTimes[companyName][trip.trip_id][0].arrival_time
    )
  )

  if (trips.length === 0) {
    if (process.env.NODE_ENV !== 'test') console.warn(companyName, routeId)

    throw createHttpError(404, 'There is no such route.')
  }

  return trips.map<RouteStop[]>(trip =>
    stopTimes[companyName][trip.trip_id].map<RouteStop>(stopTime => ({
      sequence: stopTime.stop_sequence,
      id: stopTime.stop_id,
      name: translations[companyName][stops[companyName][stopTime.stop_id].stop_name],
      date: {
        schedule: h24ToLessH24(stopTime.arrival_time, firstStopDate).format()
      },
      location: {
        lat: stops[companyName][stopTime.stop_id].stop_lat,
        lon: stops[companyName][stopTime.stop_id].stop_lon
      },
      headsign: stopTime.stop_headsign || trip.trip_headsign,
      direction: trip.direction_id
    }))
  )
}

export async function getShapes(companyName: string, routeId: string): Promise<GetShapes> {
  const [trips, shapes] = await Promise.all([getTrips(), getGtfsShapes()])

  if (companyName in trips === false || companyName in shapes === false)
    throw createHttpError(404, 'There is no such company.')

  const shapeId = trips[companyName][routeId][Object.keys(trips[companyName][routeId])[0]].shape_id

  if (shapeId === undefined || shapeId in shapes[companyName] === false)
    throw createHttpError(404, 'There is no such shape.')

  return {
    id: shapes[companyName][shapeId][0].shape_id,
    coordinates: shapes[companyName][shapeId].map(shape => ({
      location: {
        lat: shape.shape_pt_lat,
        lon: shape.shape_pt_lon
      },
      distTraveled: shape.shape_dist_traveled
    }))
  }
}

export async function getGeoRoute(
  companyName: string,
  routeId: string
): Promise<{
  id: string
  type: string
  coordinates: [number, number][]
}> {
  const shapes = await getShapes(companyName, routeId)

  return {
    id: routeId,
    type: 'LineString',
    coordinates: shapes.coordinates.map<[number, number]>(({ location }) => [
      location.lon,
      location.lat
    ])
  }
}
