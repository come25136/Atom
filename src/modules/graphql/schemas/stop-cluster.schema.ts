import { Field, ID, InputType, ObjectType } from '@nestjs/graphql'

import { Id } from './_id.schema'
import { Location } from './location.schema'

export namespace StopCluster {
  @ObjectType('StopCluster')
  export class Output {
    @Field(type => ID)
    id: string

    @Field(type => Location.Output)
    location: Location.Output

    @Field(type => String)
    geohash: string

    @Field(type => Id.Output)
    remote: Id.Output
  }
}
