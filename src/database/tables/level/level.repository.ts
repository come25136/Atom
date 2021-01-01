import { EntityRepository } from 'typeorm'

import { BaseRepository } from '../base/base.repository'
import { Level } from './level.entity'

@EntityRepository(Level)
export class LevelRepository extends BaseRepository<Level> {}
