import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common'
import { Remote } from 'src/database/tables/remote/remote.entity'
import { RemoteService } from './remote.service'

@Injectable()
export class PipeRemoteById<T = any>
  implements PipeTransform<T, Promise<Remote>> {
  constructor(private remoteService: RemoteService) { }

  async transform(value: T, metadata: ArgumentMetadata) {
    if (typeof value !== 'string') throw new BadRequestException()

    const remoteEntity = await this.remoteService.findOneByRemoteId(value)

    if (remoteEntity === undefined) {
      throw new NotFoundException()
    }

    return remoteEntity
  }
}

@Injectable()
export class PipeRemoteByIds<T = any>
  implements PipeTransform<T, Promise<Remote[]>> {
  constructor(private remoteService: RemoteService) { }

  async transform(value: T, metadata: ArgumentMetadata) {
    if (!Array.isArray(value)) throw new BadRequestException()

    const remoteEntites = await this.remoteService.findByRemoteIds(value)

    return remoteEntites
  }
}
