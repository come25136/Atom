import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Remote } from './remote.entity';
import { REMOTE_REPOSITORY } from '../constants';

@Injectable()
export class RemoteService {
  constructor(
    @Inject(REMOTE_REPOSITORY) private remoteRepository: Repository<Remote>,
  ) { }

  async registration(id: string, hash: string): Promise<Remote> {
    const remote = this.remoteRepository.create({ id, hash })

    return this.remoteRepository.save(remote)
  }

  async findAll(): Promise<Remote[]> {
    return this.remoteRepository.find();
  }
}
