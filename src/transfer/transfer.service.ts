import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common';
import { Remote } from 'src/database/entities/remote.entity';
import { Transfer } from 'src/database/entities/transfer.entity';
import { TransferRepository } from 'src/database/entities/transfer.repository';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class TransferService {
  constructor(
    private transferRepository: TransferRepository,
  ) { }

  @Transactional()
  async createOrUpdate(remoteUid: Remote['uid'], data: GTFS.Transfer): Promise<Transfer> {
    const transferEntity =
      await this.transferRepository.findOneByRemoteUidAndFronStopIdAndToStopId(remoteUid, data.stop.from.id, data.stop.to.id)
      ?? this.transferRepository.create({ fromStopId: data.stop.from.id, toStopId: data.stop.to.id })
    transferEntity.type = data.type
    transferEntity.minTransferTime = 'time' in data ? data.time.min : null

    return transferEntity
  }

  @Transactional()
  async save(entities: Transfer[]) {
    return this.transferRepository.save(entities)
  }
}
