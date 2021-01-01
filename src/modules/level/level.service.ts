import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { Level } from 'src/database/tables/level/level.entity'
import { LevelRepository } from 'src/database/tables/level/level.repository'
import { Remote } from 'src/database/tables/remote/remote.entity'

@Injectable()
export class LevelService {
  constructor(private levelRepository: LevelRepository) {}

  create(remoteUid: Remote['uid'], data: GTFS.Level): Level {
    const transferEntity = this.levelRepository.create({ id: data.id })
    transferEntity.index = data.index
    transferEntity.name = data.name

    return transferEntity
  }

  @Transactional()
  async getUidOnly(id: Level['id']) {
    const level = await this.levelRepository.findOneById(id, {
      select: ['uid'],
    })

    return level
  }

  @Transactional()
  async save(entities: Level[], updateEntity = false) {
    return this.levelRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.levelRepository.getUniqueColumns,
        overwrite: [...this.levelRepository.getUniqueColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }
}
