import { EntityRepository } from 'typeorm'

import { BaseRepository } from '../base/base.repository'
import { Remote } from './remote.entity'

@EntityRepository(Remote)
export class RemoteRepository extends BaseRepository<Remote> {}