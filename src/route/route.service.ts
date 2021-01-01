import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional-cls-hooked'

import { Remote } from 'src/database/remote/remote.entity'
import { Route } from 'src/database/route/route.entity'
import { RouteRepository } from 'src/database/route/route.repository'

@Injectable()
export class RouteService {
  constructor(private routeRepository: RouteRepository) {}

  create(remoteUid: Remote['uid'], data: GTFS.Route): Route {
    const agencyEntity = this.routeRepository.create({ id: data.id })
    agencyEntity.agencyId = data.agencyId
    agencyEntity.shortName = data.name.short
    agencyEntity.longName = data.name.long
    agencyEntity.description = data.description
    agencyEntity.type = data.type
    agencyEntity.url = data.url
    agencyEntity.color = data.color
    agencyEntity.textColor = data.textColor
    agencyEntity.sortOrder = data.sortOrder

    return agencyEntity
  }

  @Transactional()
  async getUidsOnly(remoteUid: Remote['uid'], agencyId: Route['agencyId']) {
    const route = await this.routeRepository.findByAgencyId(
      remoteUid,
      agencyId,
      {
        select: ['uid'],
      },
    )

    return route
  }

  @Transactional()
  async save(entities: Route[], updateEntity = false) {
    return this.routeRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({
        conflict_target: this.routeRepository.getUniqueColumns,
        overwrite: [...this.routeRepository.getUniqueColumns, 'updatedAt'],
      })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }

  @Transactional()
  async linkAgency(...args: Parameters<RouteRepository['linkAgency']>) {
    return this.routeRepository.linkAgency(...args)
  }
}
