import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Attribution } from 'src/database/tables/attribution/attribution.entity'
import { AttributionRepository } from 'src/database/tables/attribution/attribution.repository'
import { Remote } from 'src/database/tables/remote/remote.entity'
import { Transactional } from 'typeorm-transactional-cls-hooked'

@Injectable()
export class AttributionService {
  constructor(private attributionRepository: AttributionRepository) {}

  create(remoteUid: Remote['uid'], data: GTFS.Attribution): Attribution {
    const atributionEntity = this.attributionRepository.create({
      organizationName: data.organization.name,
    })
    atributionEntity.id = data.id
    atributionEntity.agencyId = data.agency.id
    atributionEntity.routeId = data.route.id
    atributionEntity.tripId = data.trip.id
    atributionEntity.isProducer = data.isProducer
    atributionEntity.isOperator = data.isOperator
    atributionEntity.isAuthority = data.isAuthority
    atributionEntity.url = data.url
    atributionEntity.email = data.email
    atributionEntity.phone = data.phone

    return atributionEntity
  }

  @Transactional()
  async save(entities: Attribution[], updateEntity = false) {
    return this.attributionRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.attributionRepository.getUniqueColumns,
        overwrite: [
          ...this.attributionRepository.getUniqueColumns,
          'updatedAt',
        ],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }

  @Transactional()
  async linkAgency(...args: Parameters<AttributionRepository['linkAgency']>) {
    return this.attributionRepository.linkAgency(...args)
  }

  @Transactional()
  async findByRmoteUidAndRouteId_GetUidsOnly(
    remoteUid: Remote['uid'],
    routeId: Attribution['routeId'],
  ) {
    return this.attributionRepository.find({
      where: {
        routeId,
        remote: {
          uid: remoteUid,
        },
      },
    })
  }
}
