import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Remote } from '../database/entities/remote.entity';

@Injectable()
export class RemoteService {
  constructor(
    @InjectRepository(Remote) private remoteRepository: Repository<Remote>,
  ) { }

  async registration(id: string, hash: string): Promise<Remote> {
    const remote = this.remoteRepository.create({ id, hash })

    return this.remoteRepository.save(remote)
  }

  async findAll(): Promise<Remote[]> {
    return this.remoteRepository.find();
  }
}
