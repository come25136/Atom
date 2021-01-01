import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { ISO4217 } from 'src/util'
import { Remote } from 'src/database/tables/remote/remote.entity'
import { FareAttributeRepository } from 'src/database/tables/fare-attribute/fare_attribute.repository'
import { FareAttribute } from 'src/database/tables/fare-attribute/fare_attribute.entity'

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
      .orUpdate({
        conflict_target: this.fareAttributeRepository.getUniqueColumns,
        overwrite: [
          ...this.fareAttributeRepository.getUniqueColumns,
          'updatedAt',
        ],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }

  async linkAgency(...args: Parameters<FareAttributeRepository['linkAgency']>) {
    return this.fareAttributeRepository.linkAgency(...args)
  }

  @Transactional()
  async getUidsOnly(
    remoteUId: Remote['uid'],
    agencyId: FareAttribute['agencyId'],
  ) {
    const agency = await this.fareAttributeRepository.findByAgencyId(
      remoteUId,
      agencyId,
      {
        select: ['uid'],
      },
    )

    return agency
  }
}
