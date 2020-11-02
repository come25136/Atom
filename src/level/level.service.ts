import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Level } from 'src/database/entities/level.entity'
import { LevelRepository } from 'src/database/entities/level.repository'
import { Remote } from 'src/database/entities/remote.entity'
import { Transactional } from 'typeorm-transactional-cls-hooked'

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
  async save(entities: Level[], updateEntity = false) {
    return this.levelRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({ overwrite: this.levelRepository.getColumns })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }
}