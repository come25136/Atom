import { getCompassDirection } from 'geolib'

import stops from '../GTFS_loader/stops'

export default (passingId: string, nextId: string, bus: { lat: number, lon: number }) => new Promise<number>(async resolve => {
  const
    // passing = await stops.then(stops => stops.get(passingId)),
    next = await stops.then(stops => stops.get(nextId)) || { stop_lat: 0, stop_lon: 0 }

  const a = getCompassDirection(
    { latitude: bus.lat, longitude: bus.lon },
    { latitude: next.stop_lat, longitude: next.stop_lon }
  )

  resolve(a.bearing)
})
