import { EntityRepository, FindOneOptions } from "typeorm";
import { BaseRepository } from "./base.repository";
import { Remote } from "./remote.entity";
import { Shape } from "./shape.entity";

@EntityRepository(Shape)
export class ShapeRepository extends BaseRepository<Shape> {
  async findOneByRemoteUidAndIdAndSequence(remoteUid: Remote['uid'], id: Shape['id'], sequence: Shape['sequence'], other?: FindOneOptions<Shape>): Promise<Shape> {
    return this.findOne({
      ...other,
      where: {
        id,
        sequence,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }
}
