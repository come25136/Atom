import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { Logger } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { GTFSContracts } from './event.contract'
import { RemoteService } from './remote.service'

import { CrawlStatus, Remote } from 'src/database/tables/remote/remote.entity'

@Processor(GTFSContracts.inject)
export class WorkerService {
  constructor(private readonly remoteService: RemoteService) { }

  @Process(GTFSContracts.import)
  async impoort({ data: remoteUid }: Job) {
    Logger.debug('Start importing...', 'Atom', false)

    const remoteEntity = await this.remoteService.findOneByRemoteUId(remoteUid)

    try {
      await this.remoteService.setCrawlStatus(remoteEntity, CrawlStatus.IMPORTING)
      const gtfsArchiveData = await this.remoteService.GTFSDownloadAndAnalyzer(
        remoteEntity,
      )
      await this.remoteService.importGTFSStaticData(
        remoteEntity,
        gtfsArchiveData,
      )

      await this.remoteService.setCrawlStatus(
        remoteEntity,
        CrawlStatus.IMPORTED,
      )
    } catch (err) {
      Logger.error(err.stack)

      await this.remoteService.setCrawlStatus(remoteEntity, CrawlStatus.ERROR)
    }

    Logger.debug('Import completed')
  }
}
