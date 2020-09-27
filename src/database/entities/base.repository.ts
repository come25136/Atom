import { FindOneOptions, ObjectLiteral, } from "typeorm";
import { BaseRepository as ClsBaseRepository } from "typeorm-transactional-cls-hooked";
import { Remote } from "./remote.entity";

export class BaseRepository<Entity extends ObjectLiteral> extends ClsBaseRepository<Entity> {
  async findOneByRemoteUid(remoteUid: Remote['uid'], other?: FindOneOptions<Entity>): Promise<Entity> {
    return this.findOne({
      ...other,
      where: {
        remote: {
          uid: remoteUid
        },
      },
    })
  }

  async findOneByRemoteUidAndId(remoteUid: Remote['uid'], id: Entity['id'], other?: FindOneOptions<Entity>): Promise<Entity> {
    return this.findOne({
      ...other,
      where: {
        id,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  async findOneById(id: Entity['id'], other?: FindOneOptions<Entity>): Promise<Entity> {
    return this.findOne({
      ...other,
      where: {
        id
      },
    })
  }
}
