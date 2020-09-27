import * as GTFS from '@come25136/gtfs';
import { Injectable } from '@nestjs/common';
import { Agency } from 'src/database/entities/agency.entity';
import { AgencyRepository } from 'src/database/entities/agency.repository';
import { Remote } from 'src/database/entities/remote.entity';
import { Translation } from 'src/database/entities/translation.entity';
import { Connection } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class AgencyService {
  constructor(
    private connection: Connection,
    private agencyRepository: AgencyRepository,
  ) { }

  @Transactional()
  async createOrUpdate(remoteUid: Remote['uid'], data: GTFS.Agency): Promise<Agency> {
    const agencyEntity =
      await this.agencyRepository.findOneByRemoteUidAndId(remoteUid, data.id)
      ?? this.agencyRepository.create({ id: data.id })
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
  async save(entities: Agency[]) {
    return this.agencyRepository.save(entities)
  }

  async translate(remoteUid: Remote["uid"], agency: Agency, language: string) {
    return this.connection.transaction(async trn => {
      const remote = { uid: remoteUid }

      const translationRepo = trn.getRepository(Translation)

      const name = await translationRepo.findOne({
        where: [{
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          recordId: agency.id
        },
        {
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          field_value: agency.name
        }]
      })

      const url = await translationRepo.findOne({
        where: [{
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_url',
          recordId: agency.id
        },
        {
          remote: remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          field_value: agency.url
        }]
      })

      const phone = await translationRepo.findOne({
        where: [{
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_phone',
          recordId: agency.id
        },
        {
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          field_value: agency.phone
        }]
      })

      const fareUrl = await translationRepo.findOne({
        where: [{
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_fare_url',
          recordId: agency.id
        },
        {
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          field_value: agency.fareUrl
        }]
      })

      const email = await translationRepo.findOne({
        where: [{
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_email',
          recordId: agency.id
        },
        {
          remote,
          language,
          tableName: 'agency',
          fieldName: 'agency_name',
          field_value: agency.email
        }]
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
        email: email?.translation ?? agency.email
      }
    })
  }
}
