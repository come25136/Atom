import { Field, InputType, ObjectType } from '@nestjs/graphql'

export namespace OptionalURL {
  @InputType('OptionalURLInput')
  export class Input {
    @Field({ nullable: true })
    url: string | null
  }

  @ObjectType('OptionalURL')
  export class Output {
    @Field({ nullable: true })
    url: string | null
  }
}
