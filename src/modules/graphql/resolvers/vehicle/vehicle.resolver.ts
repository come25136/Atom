import { Inject } from "@nestjs/common";
import { Resolver, Subscription } from "@nestjs/graphql";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { REDIS_PUB_SUB_TOKEN } from "nestjs-graphql-redis-subscriptions";

import { Vehicle } from "../../schemas/vehicle.schema";

@Resolver(of => [Vehicle.Output])
export class VehicleResolver {
  constructor(
    @Inject(REDIS_PUB_SUB_TOKEN) private pubSub: RedisPubSub,
  ) { }

  @Subscription(returns => [Vehicle.Output], {
    resolve: (payload, args, context, info) => payload,
  })
  vehicles() {
    return this.pubSub.asyncIterator('vehicles');
  }
}
