import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'

import { FareAttribute } from 'src/database/entities/fare_attribute.entity'
import { FareAttributeRepository } from 'src/database/entities/fare_attribute.repository'
import { ISO4217 } from 'src/util'
import { Remote } from 'src/database/entities/remote.entity'
import { Transactional } from 'typeorm-transactional-cls-hooked'

@Injectable()
export class FareAttributeService {
  constructor(private fareAttributeRepository: FareAttributeRepository) {}

  create(
    remoteUid: Remote['uid'],
    data: { id: GTFS.FareAttribute['fareId'] } & Omit<
      GTFS.FareAttribute,
      'fareId'
    >,
  ): FareAttribute {
    const fareAttributeEntity = this.fareAttributeRepository.create({
      id: data.id,
      currencyType: ISO4217[data.currencyType],
    })
    fareAttributeEntity.paymentMethod = data.paymentMethod
    fareAttributeEntity.transfers = data.transfers
    fareAttributeEntity.agencyId = data.agencyId
    fareAttributeEntity.transferDuration = data.transferDuration

    return fareAttributeEntity
  }

  @Transactional()
  async save(entities: FareAttribute[], updateEntity = false) {
    return this.fareAttributeRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({ overwrite: this.fareAttributeRepository.getColumns })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }
}
