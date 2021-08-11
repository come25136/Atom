import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger'
import { Body, Controller, Inject, Param, Put } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Get } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'

import { CrawlStatus } from 'src/database/tables/remote/remote.entity'

import {
  FindRemoteDto,
  RegisterRemoteDto,
  RegistrationRemoteDto,
  StatusResult,
} from '../interfaces/remote.dto'

import { RemoteService } from 'src/modules/remote/remote.service'

import { GTFSContracts } from './event.contract'
import { Remote } from '../graphql/schemas/remote.schema'

@Controller()
export class RemoteController {
  constructor(
    private readonly service: RemoteService,
    @Inject(GTFSContracts.inject) private readonly client: ClientProxy,
    @InjectQueue(GTFSContracts.inject) private readonly gtfsQueue: Queue,
  ) { }

  @Put(':id')
  @ApiCreatedResponse({ type: FindRemoteDto })
  async registration(
    @Param() params: any,
    @Body() body: RegistrationRemoteDto,
  ): Promise<RegisterRemoteDto> {
    const result = await this.client
      .send<{ uid: number; crawl: { status: CrawlStatus } }>(
        GTFSContracts.remoteRegister,
        { ...params, ...body },
      )
      .toPromise()

    const status = [
      CrawlStatus.INITING,
      CrawlStatus.PENDING,
      CrawlStatus.IMPORTING,
    ]

    if (status.includes(result.crawl.status) === false)
      await this.gtfsQueue.add(GTFSContracts.import, result.uid)

    return {
      crawl: {
        status: StatusResult[result.crawl.status],
      },
    }
  }

  @Get()
  @ApiOkResponse({ type: FindRemoteDto })
  async findAll(): Promise<Remote.Input[]> {
    const remotes = await this.service.findAllResponse()

    return remotes
  }
}
