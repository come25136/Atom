import { EntityRepository, FindManyOptions } from 'typeorm'

import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { Stop } from '../stop/stop.entity'
import { FareRule } from './fare_rule.entity'

@EntityRepository(FareRule)
export class FareRuleRepository extends BaseRepository<FareRule> {
  async findByRmoteUidAndOriginId(
    remoteUid: Remote['uid'],
    originId: FareRule['originId'],
    other?: FindManyOptions<FareRule>,
  ) {
    return this.find({
      ...other,
      where: {
        originId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  async linkOrigin(
    remoteUid: Remote['uid'],
    stopUid: Stop['uid'],
    zoneId: Stop['zoneId'],
  ) {
    return this.createQueryBuilder()
      .update()
      .set({ origin: { uid: stopUid } })
      .where({ remote: { uid: remoteUid }, originId: zoneId })
      .execute()
  }

  async linkDestination(
    remoteUid: Remote['uid'],
    stopUid: Stop['uid'],
    zoneId: Stop['zoneId'],
  ) {
    return this.createQueryBuilder()
      .update()
      .set({ destination: { uid: stopUid } })
      .where({ remote: { uid: remoteUid }, destinationId: zoneId })
      .execute()
  }

  async linkContain(
    remoteUid: Remote['uid'],
    stopUid: Stop['uid'],
    zoneId: Stop['zoneId'],
  ) {
    return this.createQueryBuilder()
      .update()
      .set({ contain: { uid: stopUid } })
      .where({ remote: { uid: remoteUid }, containId: zoneId })
      .execute()
  }
}
