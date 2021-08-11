import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { OptionalURL } from './optional-utl.schema'

export namespace OptionalFetchedData {
  @InputType('OptionalFetchedDataInput')
  export class Input extends OptionalURL.Input {
  }

  @ObjectType('OptionalFetchedData')
  export class Output extends OptionalURL.Output {
    @Field({ nullable: true })
    lastFetchedDate: string | null // ISO8601F
  }
}
