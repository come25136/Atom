import { Injectable } from '@nestjs/common';
import { GtfsStaticRepository } from 'src/database/entities/gtfs_static.repository';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { Remote } from 'src/database/entities/remote.entity';
import { createHash } from 'crypto';
import * as moment from 'moment'
import axios from 'axios'
import { GtfsStatic } from 'src/database/entities/gtfs_static.entity';

@Injectable()
export class GtfsStaticService {
  constructor(
    private gtfsStaticRepository: GtfsStaticRepository,
  ) { }

  @Transactional()
  async createOrUpdate(remoteUid: Remote['uid'], url: string): Promise<GtfsStatic> {
    const { data: gtfsStaticBuffer } = await axios.get(url, { responseType: 'arraybuffer' })
    const gtfsStaticHash = createHash('sha256').update(gtfsStaticBuffer).digest('hex')

    const gtfsEntity = await this.gtfsStaticRepository.findOneByRemoteUid(remoteUid) ?? this.gtfsStaticRepository.create({})
    gtfsEntity.url = url
    gtfsEntity.hash = gtfsStaticHash
    gtfsEntity.lastAcquisitionDate = moment()

    return gtfsEntity
  }
}
