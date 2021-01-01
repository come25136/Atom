import { Body, Controller, Param, Put } from '@nestjs/common'
import { ApiCreatedResponse } from '@nestjs/swagger'

import { RemoteService } from 'src/modules/remote/remote.service'
import { Remote } from 'src/database/tables/remote/remote.entity'

import { RegistrationRemoteDto } from '../interfaces/remote.dto'

@Controller('remotes')
export class RemoteController {
  constructor(private readonly service: RemoteService) {}

  @Put(':id')
  @ApiCreatedResponse({ type: Remote })
  async registration(
    @Param() params: any,
    @Body() body: RegistrationRemoteDto,
  ): Promise<Remote> {
    return this.service.registration({ ...params, ...body })
  }
}
