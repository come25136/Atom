import { Injectable } from '@nestjs/common';
import { Remote } from 'src/database/entities/remote.entity';
import { Translation } from 'src/database/entities/translation.entity';
import { TranslationRepository, TranslationType } from 'src/database/entities/translation.repository';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class TranslationService {
  constructor(
    private translationRepository: TranslationRepository,
  ) { }

  @Transactional()
  async createOrUpdate(remoteUid: Remote['uid'], data: TranslationType): Promise<Translation> {
    const translationEntity =
      await this.translationRepository.findOneByRemoteUidAndTableNameAndFieldNameAndLanguageAndRecordIdAndRecordSubIdOrFieldValue(remoteUid, data)
      ?? this.translationRepository.create({ tableName: data.tableName, fieldName: data.fieldName, language: data.language })
    translationEntity.translation = data.translation
    translationEntity.recordId = 'record' in data ? data.record.id : null
    translationEntity.recordSubId = 'record' in data ? data.record.sub?.id ?? null : null
    translationEntity.fieldValue = 'fieldValue' in data ? data.fieldValue : null

    return translationEntity
  }

  @Transactional()
  async save(entities: Translation[]) {
    return this.translationRepository.save(entities)
  }
}
