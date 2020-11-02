import { EntityRepository } from 'typeorm'

import { BaseRepository } from './base.repository'
import { Route } from './route.entity'

@EntityRepository(Route)
export class RouteRepository extends BaseRepository<Route> {}
