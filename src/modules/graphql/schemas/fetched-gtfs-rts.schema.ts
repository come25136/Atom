import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { OptionalFetchedData } from './optional-fetchrd-data.schema'

export namespace FetchedGTFSRTs {
  @InputType('FetchedGTFSRTsInput')
  export class Input {
    @Field(type => OptionalFetchedData.Input)
    trip_update: OptionalFetchedData.Input

    @Field(type => OptionalFetchedData.Input)
    vehicle_position: OptionalFetchedData.Input

    @Field(type => OptionalFetchedData.Input)
    alert: OptionalFetchedData.Input
  }

  @ObjectType('FetchedGTFSRTs')
  export class Output {
    @Field(type => OptionalFetchedData.Output)
    trip_update: OptionalFetchedData.Output

    @Field(type => OptionalFetchedData.Output)
    vehicle_position: OptionalFetchedData.Output

    @Field(type => OptionalFetchedData.Output)
    alert: OptionalFetchedData.Output
  }
}
