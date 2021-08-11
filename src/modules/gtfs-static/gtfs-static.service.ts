import * as dayjs from 'dayjs'
import { HttpService, Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'
import { createHash } from 'crypto'

import { GtfsStatic } from 'src/database/tables/gtfs-static/gtfs_static.entity'
import { GtfsStaticRepository } from 'src/database/tables/gtfs-static/gtfs_static.repository'
import { Remote } from 'src/database/tables/remote/remote.entity'

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
    const gtfsStaticHash = createHash('sha256')
    const { data: gtfsStaticStream } = await this.httpService
      .get(url, {
        responseType: 'stream',
      })
      .toPromise()

    const gtfsStaticCalcedHash = await new Promise<string>((res, rej) => {
      gtfsStaticStream.on('data', chunk => gtfsStaticHash.update(chunk))
      gtfsStaticStream.on('close', () => res(gtfsStaticHash.digest('hex')))
      gtfsStaticStream.on('error', rej)
    })

    const gtfsEntity =
      (await this.gtfsStaticRepository.findOneByRemoteUid(remoteUid)) ??
      this.gtfsStaticRepository.create({})
    gtfsEntity.url = url
    gtfsEntity.latestFetchedHash = gtfsStaticCalcedHash
    gtfsEntity.latestFetchedDate = dayjs()

    return gtfsEntity
  }
}
