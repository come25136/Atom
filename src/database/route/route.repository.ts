import { EntityRepository, FindOneOptions } from 'typeorm'

import { BaseRepository } from './base.repository'
import { Remote } from './remote.entity'
import { Route } from './route.entity'

@EntityRepository(Route)
export class RouteRepository extends BaseRepository<Route> {
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
