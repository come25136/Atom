// NOTE: 特定のデータ構造に依存しない特殊なファイル
//       Idだけのスキーマ

import { Field, ID, InputType, ObjectType } from '@nestjs/graphql'

export namespace OptionalId {
  @InputType('OptionalIdInput')
  export class Input {
    @Field(() => ID, { nullable: true })
    id: string | null
  }

  @ObjectType('OptionalId')
  export class Output {
    @Field(() => ID, { nullable: true })
    id: string | null
  }
}
