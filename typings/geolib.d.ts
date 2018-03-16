import { PositionAsDecimal, Distance } from 'geolib'

declare module 'geolib' {
  function findNearest(
    latlng: PositionAsDecimal,
    coords: PositionAsDecimal[] | { [key: string]: PositionAsDecimal },
    offset?: number,
    limit?: number
  ): Distance[] | Distance
}
