import { Field, InputType, ObjectType } from '@nestjs/graphql'

export namespace URL {
  @InputType('URLInput')
  export class Input {
    @Field()
    url: string
  }

  @ObjectType('URL')
  export class Output {
    @Field()
    url: string
  }
}
