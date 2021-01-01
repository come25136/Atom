import { EntityRepository } from 'typeorm'

import { BaseRepository } from '../base/base.repository'
import { Trip } from './trip.entity'

@EntityRepository(Trip)
export class TripRepository extends BaseRepository<Trip> {}
