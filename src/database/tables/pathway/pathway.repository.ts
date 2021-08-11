import { EntityRepository } from 'typeorm'

import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { Stop } from '../stop/stop.entity'
import { Pathway } from './pathway.entity'

@EntityRepository(Pathway)
export class PathwayRepository extends BaseRepository<Pathway> {
  async linkFromStop(
    remoteUid: Remote['uid'],
    fromStopUid: Stop['uid'],
    fromStopId: Stop['id'],
  ) {
    return this.createQueryBuilder()
      .update()
      .set({ fromStop: { uid: fromStopUid } })
      .where({ remote: { uid: remoteUid }, fromStopId })
      .execute()
  }

  async linkToStop(
    remoteUid: Remote['uid'],
    toStopUid: Stop['uid'],
    toStopId: Stop['id'],
  ) {
    return this.createQueryBuilder()
      .update()
      .set({ toStop: { uid: toStopUid } })
      .where({ remote: { uid: remoteUid }, toStopId })
      .execute()
  }
}
