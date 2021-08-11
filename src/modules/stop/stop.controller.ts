import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'
import { PipeRemoteById } from '../remote/remote.pipe'
import { Remote } from 'src/database/tables/remote/remote.entity'

import { StopService } from './stop.service'

@Controller()
export class StopController {
  constructor(private readonly service: StopService) {}

  @Get()
  @ApiParam({ name: 'remoteId', type: String })
  async findAll(
    @Param('remoteId', PipeRemoteById) remote: Remote,
  ): Promise<any> {
    return this.service.findByRemoteUid(remote.uid)
  }

  @Get(':stopId')
  @ApiParam({ name: 'remoteId', type: String })
  async findOne(
    @Param('remoteId', PipeRemoteById) remote: Remote,
    @Param('stopId') stopId: string,
  ): Promise<any> {
    const stopEntity = await this.service.findOneByRemoteUidAndId(
      remote.uid,
      stopId,
    )

    if (stopEntity === undefined) throw new NotFoundException()

    return stopEntity
  }
}
