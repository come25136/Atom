import * as GTFS from '@come25136/gtfs'
import { Injectable } from '@nestjs/common'
import { Remote } from 'src/database/entities/remote.entity'
import { Route } from 'src/database/entities/route.entity'
import { RouteRepository } from 'src/database/entities/route.repository'
import { Transactional } from 'typeorm-transactional-cls-hooked'

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
    agencyEntity.color = data.url
    agencyEntity.textColor = data.textColor
    agencyEntity.sortOrder = data.sortOrder

    return agencyEntity
  }

  @Transactional()
  async save(entities: Route[], updateEntity = false) {
    return this.routeRepository
      .createQueryBuilder()
      .insert()
      .orUpdate({ overwrite: this.routeRepository.getColumns })
      .values(entities)
      .updateEntity(updateEntity)
      .execute()
  }
}
