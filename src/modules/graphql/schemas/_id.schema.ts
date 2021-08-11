// NOTE: 特定のデータ構造に依存しない特殊なファイル
//       Idだけのスキーマ

import { Field, ID, InputType, ObjectType } from '@nestjs/graphql'

export namespace Id {
  @InputType('IdInput')
  export class Input {
    @Field(() => ID)
    id: string
  }

  @ObjectType('Id')
  export class Output {
    @Field(() => ID)
    id: string
  }
}
