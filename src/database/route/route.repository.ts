import { EntityRepository, FindOneOptions } from 'typeorm'

import { Agency } from '../agency/agency.entity'
import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { Route } from './route.entity'

@EntityRepository(Route)
export class RouteRepository extends BaseRepository<Route> {
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
    agencyId: Route['agencyId'],
    other?: FindOneOptions<Route>,
  ): Promise<Route[]> {
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
