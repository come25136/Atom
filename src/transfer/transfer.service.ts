import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { Remote } from 'src/database/entities/remote.entity'
import { Transfer } from 'src/database/entities/transfer.entity'
import { TransferRepository } from 'src/database/entities/transfer.repository'

@Injectable()
export class TransferService {
  constructor(private transferRepository: TransferRepository) { }

  create(remoteUid: Remote['uid'], data: GTFS.Transfer): Transfer {
    const transferEntity = this.transferRepository.create({
      fromStopId: data.stop.from.id,
      toStopId: data.stop.to.id,
    })
    transferEntity.type = data.type
    transferEntity.minTransferTime = 'time' in data ? data.time.min : null

    return transferEntity
  }

  @Transactional()
  async save(entities: Transfer[], updateEntity = false) {
    return this.transferRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.transferRepository.getColumns,
        overwrite: [...this.transferRepository.getColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }

  @Transactional()
  async findByRmoteUidAndFromStopId_GetUidsOnly(remoteUid: Remote['uid'], fromStopId: Transfer['fromStopId']) {
    return this.transferRepository.find({
      select: ['uid'],
      where: {
        fromStopId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  @Transactional()
  async findByRmoteUidAndToStopId_GetUidsOnly(remoteUid: Remote['uid'], toStopId: Transfer['toStopId']) {
    return this.transferRepository
      .find({
        select: ['uid'],
        where: {
          toStopId,
          remote: {
            uid: remoteUid,
          },
        },
      })
  }
}
