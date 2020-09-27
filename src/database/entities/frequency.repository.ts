import { EntityRepository, FindOneOptions } from "typeorm";
import { BaseRepository } from "./base.repository";
import { Frequency } from "./frequency.entity";
import { Remote } from "./remote.entity";

@EntityRepository(Frequency)
export class FrequencyRepository extends BaseRepository<Frequency> {
  async findOneByRemoteUidAndId(): Promise<Frequency> {
    throw new Error('The function cannot be used because there is no ID in Frequency.')
  }

  async findOneByRemoteUidAndTripIdAndStartTimeAndEndTime(remoteUid: Remote['uid'], tripId: Frequency['tripId'], startTime: Frequency['startTime'], endTime: Frequency['endTime'], other?: FindOneOptions<Frequency>): Promise<Frequency> {
    return this.findOne({
      ...other,
      where: {
        tripId,
        startTime,
        endTime,
        remote: {
          uid: remoteUid,
        },
      }
    })
  }
}
