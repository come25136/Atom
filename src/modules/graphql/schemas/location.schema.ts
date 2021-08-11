import { Field, InputType, ObjectType } from '@nestjs/graphql'

export namespace Location {
  @InputType('LocationInput')
  export class Input {
    @Field()
    lat: number

    @Field()
    lon: number
  }

  @ObjectType('Location')
  export class Output {
    @Field()
    lat: number

    @Field()
    lon: number
  }
}
