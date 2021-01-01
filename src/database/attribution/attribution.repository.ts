import { EntityRepository, FindOneOptions } from 'typeorm'

import { Attribution } from './attribution.entity'
import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { Agency } from '../agency/agency.entity'

@EntityRepository(Attribution)
export class AttributionRepository extends BaseRepository<Attribution> {
  async findByAgencyId(
    remoteUid: Remote['uid'],
    agencyId: Attribution['agencyId'],
    other?: FindOneOptions<Attribution>,
  ): Promise<Attribution[]> {
    return this.find({
      ...other,
      where: {
        agencyId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }
}
