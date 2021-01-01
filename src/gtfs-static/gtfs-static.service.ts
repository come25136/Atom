import * as moment from 'moment'
import { HttpService, Injectable } from '@nestjs/common'
import { createHash } from 'crypto'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { Remote } from 'src/database/remote/remote.entity'
import { GtfsStatic } from 'src/database/gtfs-static/gtfs_static.entity'
import { GtfsStaticRepository } from 'src/database/gtfs-static/gtfs_static.repository'

@Injectable()
export class GtfsStaticService {
  constructor(
    private gtfsStaticRepository: GtfsStaticRepository,
    private httpService: HttpService,
  ) {}

  @Transactional()
  async createOrUpdate(
    remoteUid: Remote['uid'],
    url: string,
  ): Promise<GtfsStatic> {
    const { data: gtfsStaticBuffer } = await this.httpService
      .get(url, {
        responseType: 'arraybuffer',
      })
      .toPromise()
    const gtfsStaticHash = createHash('sha256')
      .update(gtfsStaticBuffer)
      .digest('hex')

    const gtfsEntity =
      (await this.gtfsStaticRepository.findOneByRemoteUid(remoteUid)) ??
      this.gtfsStaticRepository.create({})
    gtfsEntity.url = url
    gtfsEntity.hash = gtfsStaticHash
    gtfsEntity.lastAcquisitionDate = moment()

    return gtfsEntity
  }
}
