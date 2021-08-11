import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common'
import { Remote } from 'src/database/tables/remote/remote.entity'
import { RemoteService } from '../modules/remote/remote.service'

@Injectable()
export class PipeRemoteByIds<T = any>
  implements PipeTransform<T, Promise<T | Remote[]>> {
  constructor(private remoteService: RemoteService) {}

  async transform(value: T, metadata: ArgumentMetadata) {
    if (value === undefined) return []
    if (typeof value !== 'string') return value

    const remoteIds = value.split(',')

    const remoteEntities = await this.remoteService.findByRemoteIds(remoteIds)

    return remoteEntities
  }
}
