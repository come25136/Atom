import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices'
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { Remote as RemoteSchema } from "../../schemas/remote.schema";

import { GTFSContracts } from 'src/modules/remote/event.contract';
import { RemoteService } from "src/modules/remote/remote.service";
import { PipeRemoteById } from "src/modules/remote/remote.pipe";
import { Remote } from "src/database/tables/remote/remote.entity";
import { CrawlStatus } from 'src/database/tables/remote/remote.entity'


const queueAddFlags = [CrawlStatus.ERROR, CrawlStatus.IMPORTED]

@Resolver(of => [RemoteSchema.Output])
export class RemotesResolver {
  constructor(
    private remoteService: RemoteService,
    @Inject(GTFSContracts.inject) private readonly client: ClientProxy,
    @InjectQueue(GTFSContracts.inject) private readonly gtfsQueue: Queue,
  ) { }

  @Mutation(returns => RemoteSchema.Output)
  async subscribeRemote(@Args('remote') data: RemoteSchema.Input): Promise<RemoteSchema.Output> {
    const result = await this.client
      .send<{ uid: number; crawl: { status: CrawlStatus } }>(
        GTFSContracts.remoteRegister,
        data,
      )
      .toPromise()

    if (queueAddFlags.includes(result.crawl.status)) await this.gtfsQueue.add(GTFSContracts.import, result.uid)

    const remote = await this.remoteService.findOneByRemoteUId(result.uid)

    return this.remoteService.toGraphQLSchema(remote)
  }


  @Query(returns => [RemoteSchema.Output])
  async remotes(): Promise<RemoteSchema.Output[]> {
    return this.remoteService.findAllResponse();
  }

  @Query(returns => RemoteSchema.Output)
  async remote(@Args('id', { type: () => ID }, PipeRemoteById) remote: Remote): Promise<RemoteSchema.Output> {
    return this.remoteService.toGraphQLSchema(remote)
  }
}
