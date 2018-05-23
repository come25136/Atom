import { getRhumbLineBearing } from 'geolib'

import stopsPromise from './gtfs_loader/stops'

export default async function(
  passing: { lat: number; lon: number },
  next: { lat: number; lon: number },
  bus: { lat: number; lon: number }
): Promise<number> {
  const bearing = getRhumbLineBearing(
    { latitude: bus.lat, longitude: bus.lon },
    { latitude: next.lat, longitude: next.lon }
  )

  return bearing
}
