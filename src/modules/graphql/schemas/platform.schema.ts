import { Field, InputType, ObjectType } from "@nestjs/graphql"

export namespace Platform {
  @InputType('PlatformInput')
  export abstract class Input {
    @Field({ nullable: true })
    code: string | null
  }

  @ObjectType('Platform')
  export abstract class Output {
    @Field({ nullable: true })
    code: string | null
  }
}
