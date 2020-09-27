import { EntityRepository, FindOneOptions } from "typeorm";
import { Transactional } from "typeorm-transactional-cls-hooked";
import { BaseRepository } from "./base.repository";
import { GtfsRealtime } from "./gtfs_realtime.entity";
import { Remote } from "./remote.entity";

@EntityRepository(GtfsRealtime)
export class GtfsRealtimeRepository extends BaseRepository<GtfsRealtime> {
  @Transactional()
  async findOneByRemoteUidAndFeedType(remoteUid: Remote['uid'], feedType: GtfsRealtime['feedType'], other?: FindOneOptions<GtfsRealtime>): Promise<GtfsRealtime> {
    return this.findOne({
      ...other,
      where: {
        remote: {
          uid: remoteUid
        },
        feedType,
      },
    })
  }
}
