import { GTFS, Location, RouteStop, Stop } from '@come25136/gtfs'
import { findNearest } from 'geolib'
import * as _ from 'lodash'

import logger from '../../logger'

// https://jsfiddle.net/soulwire/UA6H5/
function closestPoint(
  location: Location,
  p1: Location,
  p2: Location
): {
  location: Location
  isLeft: boolean
  dot: number
  t: number
} {
  const atob = { x: p2.lon - p1.lon, y: p2.lat - p1.lat }
  const atop = { x: location.lon - p1.lon, y: location.lat - p1.lat }
  const len = atob.x * atob.x + atob.y * atob.y
  let dot = atop.x * atob.x + atop.y * atob.y
  const t = dot / len || 0

  dot = (p2.lon - p1.lon) * (location.lat - p1.lat) - (p2.lat - location.lat) * (p1.lon - p1.lon)

  return {
    location: {
      lat: p1.lat + atob.y * t,
      lon: p1.lon + atob.x * t
    },
    isLeft: dot < 1,
    dot: dot,
    t
  }
}

function detectShapeBetweenPassStopAndNextStop(
  p1: Location,
  p2: Location,
  shapePoints: ReturnType<GTFS['getShape']>['points']
) {
  const shapes = shapePoints.map(({ location }) => location)

  const pointsNearPassStop = findNearest(p1, shapes)
  const pointsNearNextStop = findNearest(p2, shapes)

  let betweenPassStopAndNextStop: boolean = false

  const shapesBetweenPassStopPointAndNextStopPoint = shapePoints.filter(({ location }) => {
    if (betweenPassStopAndNextStop === false && _.isEqual(location, pointsNearPassStop))
      return (betweenPassStopAndNextStop = true)

    if (betweenPassStopAndNextStop && _.isEqual(location, pointsNearNextStop)) {
      betweenPassStopAndNextStop = false

      return true
    }

    return betweenPassStopAndNextStop
  })

  return shapesBetweenPassStopPointAndNextStopPoint
}

export function correctionPosition(
  route: RouteStop[],
  shapePoints: ReturnType<GTFS['getShape']>['points'],
  passStop: RouteStop | RouteStop<true>,
  position: Location
): {
  location: Location
  p0: Location
  p1: Location
} {
  let passStopIndex: number = route.findIndex(routeStop => routeStop.sequence === passStop.sequence)
  passStopIndex = 0 < passStopIndex ? passStopIndex - 1 : 0 // 停留所通過する前に通過ボタンを押した時用のコード

  let nextStopIndex: number = passStopIndex + 1

  for (let i = 0; i < 5; i++) {
    if (route.length < nextStopIndex + i + 1) break

    passStopIndex = passStopIndex + i
    nextStopIndex = passStopIndex + 1

    if (route[nextStopIndex] === undefined) logger.debug(route[nextStopIndex])

    const shapesBetweenPassStopPointAndNextStopPoint = detectShapeBetweenPassStopAndNextStop(
      route[passStopIndex].location,
      route[nextStopIndex].location,
      shapePoints
    )

    for (let i = 0; i < shapesBetweenPassStopPointAndNextStopPoint.length - 1; i++) {
      const correctionAfterPosition = closestPoint(
        position,
        shapesBetweenPassStopPointAndNextStopPoint[i].location,
        shapesBetweenPassStopPointAndNextStopPoint[i + 1].location
      )

      if (correctionAfterPosition.t < 0 || 1 < correctionAfterPosition.t) continue

      return {
        location: correctionAfterPosition.location,
        p0: shapesBetweenPassStopPointAndNextStopPoint[i].location,
        p1: shapesBetweenPassStopPointAndNextStopPoint[i + 1].location
      }
    }
  }

  return {
    location: position,
    p0: route[passStopIndex].location,
    p1: route[nextStopIndex].location
  }
}

export function stopToBroadcastStop<S extends Stop>(gtfs: GTFS, stop: S): S {
  return {
    ...stop,
    name: gtfs.findTranslation(stop.name)
  }
}
