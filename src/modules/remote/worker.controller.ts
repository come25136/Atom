import { MessagePattern, Payload } from '@nestjs/microservices'
import { Controller } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { ModeDecoratores } from 'src/util'

import { RegistrationRemoteDto } from '../interfaces/remote.dto'

import { GTFSContracts } from './event.contract'

import { CrawlStatus } from 'src/database/tables/remote/remote.entity'
import { RemoteService } from 'src/modules/remote/remote.service'

const QueueAddFlags: ReadonlyArray<CrawlStatus> = [CrawlStatus.ERROR, CrawlStatus.INITING, CrawlStatus.IMPORTED]

@Controller()
export class WorkerController {
  constructor(
    private readonly remoteService: RemoteService,
    @InjectQueue(GTFSContracts.inject) private readonly gtfsQueue: Queue,
  ) { }

  @Transactional()
  @MessagePattern(GTFSContracts.remoteRegister)
  @ModeDecoratores.DataUpdater(false)
  async register(
    @Payload() data: { id: string } & RegistrationRemoteDto,
  ): Promise<{ uid: number; crawl: { status: CrawlStatus } }> {
    const remote = await this.remoteService.registrationGTFSInfo(data)

    if (QueueAddFlags.includes(remote.crawlStatus)) {
      await this.gtfsQueue.add(GTFSContracts.import, remote.uid)
    }

    return {
      uid: remote.uid,
      crawl: {
        status: remote.crawlStatus,
      },
    }
  }
}
