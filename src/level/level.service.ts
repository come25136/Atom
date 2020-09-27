import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common';
import { Level } from 'src/database/entities/level.entity';
import { LevelRepository } from 'src/database/entities/level.repository';
import { Remote } from 'src/database/entities/remote.entity';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class LevelService {
  constructor(
    private levelRepository: LevelRepository,
  ) { }

  @Transactional()
  async createOrUpdate(remoteUid: Remote['uid'], data: GTFS.Level): Promise<Level> {
    const transferEntity =
      await this.levelRepository.findOneByRemoteUidAndId(remoteUid, data.id)
      ?? this.levelRepository.create({ id: data.id })
    transferEntity.index = data.index
    transferEntity.name = data.name

    return transferEntity
  }

  @Transactional()
  async save(entities: Level[]) {
    return this.levelRepository.save(entities)
  }
}
