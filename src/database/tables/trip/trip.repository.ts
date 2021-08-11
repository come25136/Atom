import { EntityRepository, In, IsNull, Not } from 'typeorm'

import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { Route } from '../route/route.entity'
import { Trip } from './trip.entity'

@EntityRepository(Trip)
export class TripRepository extends BaseRepository<Trip> {
  async linkRoute(
    remoteUid: Remote['uid'],
    routeUid: Trip['uid'],
    routeId: Trip['id'],
  ) {
    return this.createQueryBuilder()
      .update()
      .set({ route: { uid: routeUid } })
      .where({ remote: { uid: remoteUid }, routeId })
      .execute()
  }

  async findByRemoteUidAndServiceIdAndRouteId(
    remoteUid: Remote['uid'],
    serviceIds: Trip['serviceId'][],
    routeId: Route['id'],
  ) {
    return this.find({
      where: {
        remote: { uid: remoteUid },
        serviceId: In(serviceIds),
        routeId,
      },
    })
  }
}
