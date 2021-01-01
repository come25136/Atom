import * as GTFS from '@come25136/gtfs'
import { Connection } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { Remote } from 'src/database/remote/remote.entity'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { Agency } from 'src/database/agency/agency.entity'
import { AgencyRepository } from 'src/database/agency/agency.repository'
import { Translation } from 'src/database/translation/translation.entity'

@Injectable()
export class AgencyService {
  constructor(
    private connection: Connection,
    private agencyRepository: AgencyRepository,
  ) {}

  create(remoteUid: Remote['uid'], data: GTFS.Agency): Agency {
    const agencyEntity = this.agencyRepository.create({ id: data.id })
    agencyEntity.name = data.name
    agencyEntity.url = data.url
    agencyEntity.timezone = data.timezone
    agencyEntity.lang = data.lang
    agencyEntity.phone = data.phone
    agencyEntity.fareUrl = data.fareUrl
    agencyEntity.email = data.email

    return agencyEntity
  }

  @Transactional()
  async save(entities: Agency[], updateEntity = false) {
    return this.agencyRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.agencyRepository.getUniqueColumns,
        overwrite: [...this.agencyRepository.getUniqueColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }

  @Transactional()
  async getUidOnly(remoteUId: Remote['uid'], id: Agency['id']) {
    const agency = await this.agencyRepository.findOneByRemoteUidAndId(
      remoteUId,
      id,
      {
        select: ['uid'],
      },
    )

    return agency
  }

  async translate(remoteUid: Remote['uid'], agency: Agency, language: string) {
    return this.connection.transaction(async trn => {
      const remote = { uid: remoteUid }

      const translationRepo = trn.getRepository(Translation)

      const name = await translationRepo.findOne({
        where: [
          {
            remote,
            language,
            tableName: 'agency',
            fieldName: 'agency_name',
            recordId: agency.id,
          },
          {
            remote,
            language,
            tableName: 'agency',
            fieldName: 'agency_name',
            field_value: agency.name,
          },
        ],
      })

      const url = await translationRepo.findOne({
        where: [
          {
            remote,
            language,
            tableName: 'agency',
            fieldName: 'agency_url',
            recordId: agency.id,
          },
          {
            remote: remote,
            language,
            tableName: 'agency',
            fieldName: 'agency_name',
            field_value: agency.url,
          },
        ],
      })

      const phone = await translationRepo.findOne({
        where: [
          {
            remote,
            language,
            tableName: 'agency',
            fieldName: 'agency_phone',
            recordId: agency.id,
          },
          {
            remote,
            language,
            tableName: 'agency',
            fieldName: 'agency_name',
            field_value: agency.phone,
          },
        ],
      })

      const fareUrl = await translationRepo.findOne({
        where: [
          {
            remote,
            language,
            tableName: 'agency',
            fieldName: 'agency_fare_url',
            recordId: agency.id,
          },
          {
            remote,
            language,
            tableName: 'agency',
            fieldName: 'agency_name',
            field_value: agency.fareUrl,
          },
        ],
      })

      const email = await translationRepo.findOne({
        where: [
          {
            remote,
            language,
            tableName: 'agency',
            fieldName: 'agency_email',
            recordId: agency.id,
          },
          {
            remote,
            language,
            tableName: 'agency',
            fieldName: 'agency_name',
            field_value: agency.email,
          },
        ],
      })

      return {
        uid: agency.uid,
        id: agency.id,
        name: name?.translation ?? agency.name,
        url: url?.translation ?? agency.url,
        timezone: agency.timezone,
        lang: agency.lang,
        phone: phone?.translation ?? agency.phone,
        fareUrl: fareUrl?.translation ?? agency.fareUrl,
        email: email?.translation ?? agency.email,
      }
    })
  }
}
