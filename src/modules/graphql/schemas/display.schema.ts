import { Field, InputType, ObjectType } from '@nestjs/graphql'

export namespace Display {
  @InputType('DisplayInput')
  export class Input {
    @Field()
    name: string
  }

  @ObjectType('Display')
  export class Output {
    @Field()
    name: string
  }
}
