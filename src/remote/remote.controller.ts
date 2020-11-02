import { Body, Controller, Param, Put } from '@nestjs/common'
import { ApiCreatedResponse } from '@nestjs/swagger'

import { RegistrationRemoteDto } from '../interfaces/remote.dto'
import { Remote } from 'src/database/entities/remote.entity'
import { RemoteService } from 'src/remote/remote.service'

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
