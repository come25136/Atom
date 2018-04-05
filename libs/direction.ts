import { getRhumbLineBearing } from 'geolib'

import stopsPromise from './gtfs_loader/stops'

export default async (
  passingId: string,
  nextId: string,
  bus: { lat: number; lon: number }
): Promise<number> => {
  const stops = await stopsPromise
  const next = stops[nextId] || { stop_lat: 0, stop_lon: 0 }

  const bearing = getRhumbLineBearing(
    { latitude: bus.lat, longitude: bus.lon },
    { latitude: next.stop_lat, longitude: next.stop_lon }
  )

  return bearing
}
