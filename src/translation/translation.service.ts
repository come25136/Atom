import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import {
  TranslationRepository,
  TranslationType,
} from 'src/database/entities/translation.repository'
import { Remote } from 'src/database/entities/remote.entity'
import { Translation } from 'src/database/entities/translation.entity'

@Injectable()
export class TranslationService {
  constructor(private translationRepository: TranslationRepository) {}

  create(remoteUid: Remote['uid'], data: TranslationType): Translation {
    const translationEntity = this.translationRepository.create({
      tableName: data.tableName,
      fieldName: data.fieldName,
      language: data.language,
    })
    translationEntity.translation = data.translation
    translationEntity.recordId = 'record' in data ? data.record.id : null
    translationEntity.recordSubId =
      'record' in data ? data.record.sub?.id ?? null : null
    translationEntity.fieldValue = 'fieldValue' in data ? data.fieldValue : null

    return translationEntity
  }

  @Transactional()
  async save(entities: Translation[], updateEntity = false) {
    return this.translationRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.translationRepository.getColumns,
        overwrite: [...this.translationRepository.getColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }
}
