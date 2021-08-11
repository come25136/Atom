import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { OptionalURL } from './optional-utl.schema'

export namespace License {
  @InputType('LicenseInput')
  export class Input extends OptionalURL.Input {
    @Field()
    type: string
  }

  @ObjectType('License')
  export class Output extends OptionalURL.Output {
    @Field()
    type: string
  }
}
