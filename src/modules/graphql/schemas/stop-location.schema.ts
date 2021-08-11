import { Field, InputType, ObjectType } from '@nestjs/graphql'

import { Location } from './location.schema'

export namespace StopLocation {
  @InputType('StopLocationInput')
  export class Input extends Location.Input {
    @Field()
    type: number // NOTE: stops.txt location_type
  }

  @ObjectType('StopLocation')
  export class Output extends Location.Output {
    @Field()
    type: number // NOTE: stops.txt location_type
  }
}
