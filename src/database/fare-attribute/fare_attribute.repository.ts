import { EntityRepository, FindOneOptions } from 'typeorm'

import { Agency } from '../agency/agency.entity'
import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { FareAttribute } from './fare_attribute.entity'

@EntityRepository(FareAttribute)
export class FareAttributeRepository extends BaseRepository<FareAttribute> {
  async linkAgency(
    remoteUid: Remote['uid'],
    agencyUid: Agency['uid'],
    agencyId: Agency['id'],
  ) {
    return this.createQueryBuilder()
      .update()
      .set({ agency: { uid: agencyUid } })
      .where({ remote: { uid: remoteUid }, agencyId })
      .execute()
  }

  async findByAgencyId(
    remoteUid: Remote['uid'],
    agencyId: FareAttribute['agencyId'],
    other?: FindOneOptions<FareAttribute>,
  ): Promise<FareAttribute[]> {
    return this.find({
      ...other,
      where: {
        agencyId: agencyId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  async findOneByRemoteUidAndIdAndCurrencyType(
    remoteUid: Remote['uid'],
    id: FareAttribute['id'],
    currencyType: FareAttribute['currencyType'],
    other?: FindOneOptions<FareAttribute>,
  ): Promise<FareAttribute> {
    return this.findOne({
      ...other,
      where: {
        id,
        currencyType,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }
}
