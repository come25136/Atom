import { EntityRepository, FindOneOptions } from 'typeorm'

import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { Stop } from '../stop/stop.entity'
import { Transfer } from './transfer.entity'

@EntityRepository(Transfer)
export class TransferRepository extends BaseRepository<Transfer> {
  async findOneByRemoteUidAndId(): Promise<Transfer> {
    throw new Error(
      'The function cannot be used because there is no ID in StopTime.',
    )
  }

  async findOneByRemoteUidAndFronStopIdAndToStopId(
    remoteUid: Remote['uid'],
    fromStopId: Transfer['fromStopId'],
    toStopId: Transfer['toStopId'],
    other?: FindOneOptions<Transfer>,
  ): Promise<Transfer> {
    return this.findOne({
      ...other,
      where: {
        fromStopId,
        toStopId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }
}
