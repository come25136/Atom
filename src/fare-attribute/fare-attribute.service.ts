import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common';
import { FareAttribute } from 'src/database/entities/fare_attribute.entity';
import { FareAttributeRepository } from 'src/database/entities/fare_attribute.repository';
import { Remote } from 'src/database/entities/remote.entity';
import { ISO4217 } from 'src/util';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class FareAttributeService {
  constructor(
    private fareAttributeRepository: FareAttributeRepository,
  ) { }

  @Transactional()
  async createOrUpdate(remoteUid: Remote['uid'], data: { id: GTFS.FareAttribute['fareId'] } & Omit<GTFS.FareAttribute, 'fareId'>): Promise<FareAttribute> {
    const fareAttributeEntity =
      await this.fareAttributeRepository.findOneByRemoteUidAndIdAndCurrencyType(remoteUid, data.id, ISO4217[data.currencyType])
      ?? this.fareAttributeRepository.create({ id: data.id, currencyType: ISO4217[data.currencyType] })
    fareAttributeEntity.paymentMethod = data.paymentMethod
    fareAttributeEntity.transfers = data.transfers
    fareAttributeEntity.agencyId = data.agencyId
    fareAttributeEntity.transferDuration = data.transferDuration

    return fareAttributeEntity
  }

  @Transactional()
  async save(entities: FareAttribute[]) {
    return this.fareAttributeRepository.save(entities)
  }
}
