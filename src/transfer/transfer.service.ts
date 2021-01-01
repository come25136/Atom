import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { Remote } from 'src/database/remote/remote.entity'
import { Transfer } from 'src/database/transfer/transfer.entity'
import { TransferRepository } from 'src/database/transfer/transfer.repository'

@Injectable()
export class TransferService {
  constructor(private transferRepository: TransferRepository) {}

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
        conflict_target: this.transferRepository.getUniqueColumns,
        overwrite: [...this.transferRepository.getUniqueColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }

  @Transactional()
  async linkFromStop(...args: Parameters<TransferRepository['linkFromStop']>) {
    return this.transferRepository.linkFromStop(...args)
  }

  @Transactional()
  async linkToStop(...args: Parameters<TransferRepository['linkToStop']>) {
    return this.transferRepository.linkToStop(...args)
  }

  @Transactional()
  async findByRmoteUidAndFromStopId_GetUidsOnly(
    remoteUid: Remote['uid'],
    fromStopId: Transfer['fromStopId'],
  ) {
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
  async findByRmoteUidAndToStopId_GetUidsOnly(
    remoteUid: Remote['uid'],
    toStopId: Transfer['toStopId'],
  ) {
    return this.transferRepository.find({
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
