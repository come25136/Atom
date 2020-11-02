import { FindOneOptions, ObjectLiteral } from 'typeorm'
import { BaseRepository as ClsBaseRepository } from 'typeorm-transactional-cls-hooked'
import { Remote } from './remote.entity'

export class BaseRepository<
  Entity extends ObjectLiteral
> extends ClsBaseRepository<Entity> {
  get getColumns(): string[] {
    const uniques = this.metadata.ownIndices
      .filter(u => u.isUnique)
      .map(c => c.columns.map(c2 => c2.databaseName))
      .flat()

    if (uniques.length === 0)
      return this.metadata.ownColumns
        .filter(
          c => 'relationMetadata' in c === false && c.propertyName !== 'uid',
        )
        .map(c2 => c2.databaseName)

    return uniques
  }

  async findOneByRemoteUid(
    remoteUid: Remote['uid'],
    other?: FindOneOptions<Entity>,
  ): Promise<Entity> {
    return this.findOne({
      ...other,
      where: {
        remote: {
          uid: remoteUid,
        },
      },
    })
  }

  async findOneByRemoteUidAndId(
    remoteUid: Remote['uid'],
    id: Entity['id'],
    other?: FindOneOptions<Entity>,
  ): Promise<Entity> {
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

  async findOneById(
    id: Entity['id'],
    other?: FindOneOptions<Entity>,
  ): Promise<Entity> {
    return this.findOne({
      ...other,
      where: {
        id,
      },
    })
  }
}
