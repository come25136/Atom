import { EntityRepository, FindOneOptions } from 'typeorm'

import { Attribution } from './attribution.entity'
import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { Agency } from '../agency/agency.entity'
import { Route } from '../route/route.entity'

@EntityRepository(Attribution)
export class AttributionRepository extends BaseRepository<Attribution> {
  // async linkAgency(
  //   remoteUid: Remote['uid'],
  //   routeUid: Route['uid'],
  //   routeId: Route['id'],
  // ) {
  //   return this.createQueryBuilder()
  //     .update()
  //     .set({ route: { uid: routeUid } })
  //     .where({ remote: { uid: remoteUid }, routeId: routeId })
  //     .execute()
  // }

  async linkAgency(
    remoteUid: Remote['uid'],
    agencyUid: Agency['uid'],
    agencyId: Agency['id'],
  ) {
    return this.createQueryBuilder()
      .update()
      .set({ agency: { uid: agencyUid } })
      .where({ remote: { uid: remoteUid }, agencyId })
      .execute()
  }

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
