import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { OptionalFetchedData } from './optional-fetchrd-data.schema'

export namespace FetchedData {
  @InputType('FetchedDataInput')
  export class Input extends OptionalFetchedData.Input {
    @Field()
    url: string
  }

  @ObjectType('FetchedData')
  export class Output extends OptionalFetchedData.Output {
    @Field()
    url: string

    @Field()
    lastFetchedDate: string
  }
}
