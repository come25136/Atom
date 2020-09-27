import { EntityRepository, FindOneOptions } from "typeorm";
import { BaseRepository } from "./base.repository";
import { FareAttribute } from "./fare_attribute.entity";
import { Remote } from "./remote.entity";

@EntityRepository(FareAttribute)
export class FareAttributeRepository extends BaseRepository<FareAttribute> {
  async findOneByRemoteUidAndIdAndCurrencyType(remoteUid: Remote['uid'], id: FareAttribute['id'], currencyType: FareAttribute['currencyType'], other?: FindOneOptions<FareAttribute>): Promise<FareAttribute> {
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
