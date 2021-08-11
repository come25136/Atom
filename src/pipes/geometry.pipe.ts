import * as geolib from 'geolib'
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import { Geometry } from 'src/interfaces/geometry'
import { RemoteService } from '../modules/remote/remote.service'

@Injectable()
export class PipeCoordinate<T = any>
  implements PipeTransform<T, T | Geometry.Coordinate> {
  constructor(private remoteService: RemoteService) {}

  transform(value: T, metadata: ArgumentMetadata) {
    if (typeof value !== 'string') return value

    const [latStr, lonStr] = value.split(',')
    const lat = Number(latStr)
    const lon = Number(lonStr)
    const coordinate = { lat, lon }

    if (geolib.isValidCoordinate(coordinate) === false)
      throw new BadRequestException(`${metadata.data} is not coordinate.`)

    return coordinate
  }
}
