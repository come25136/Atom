import { EntityRepository, FindOneOptions } from 'typeorm'

import { BaseRepository } from '../base/base.repository'
import { Remote } from '../remote/remote.entity'
import { Translation } from './translation.entity'

export type TranslationType = {
  tableName: Translation['tableName']
  fieldName: Translation['fieldName']
  language: Translation['language']
  translation: Translation['translation']
} & (
  | { record: { id: string; sub?: { id: Translation['recordSubId'] } } }
  | { fieldValue: string }
)

@EntityRepository(Translation)
export class TranslationRepository extends BaseRepository<Translation> {
  async findOneByRemoteUidAndId(): Promise<Translation> {
    throw new Error(
      'The function cannot be used because there is no ID in StopTime.',
    )
  }

  async findOneByRemoteUidAndTableNameAndFieldNameAndLanguageAndRecordIdAndRecordSubIdOrFieldValue(
    remoteUid: Remote['uid'],
    data: TranslationType,
    other?: FindOneOptions<Translation>,
  ): Promise<Translation> {
    if ('record' in data)
      return this.findOne({
        ...other,
        where: {
          tableName: data.tableName,
          fieldName: data.fieldName,
          language: data.language,
          recordId: data.record.id,
          recordSubId: data.record.sub?.id ?? null,
          remote: {
            uid: remoteUid,
          },
        },
      })

    return this.findOne({
      ...other,
      where: {
        tableName: data.tableName,
        fieldName: data.fieldName,
        language: data.language,
        fieldValue: data.fieldValue,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }
}
