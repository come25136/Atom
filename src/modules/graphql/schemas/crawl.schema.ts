import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { OptionalId } from './_optional-id.schema'

export namespace Crawl {
  @InputType('CrawlInput')
  export class Input {
    @Field()
    status: string
  }

  @ObjectType('Crawl')
  export class Output {
    @Field()
    status: string
  }
}
