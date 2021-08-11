import { Field, ID, InputType, ObjectType } from '@nestjs/graphql'

import { Platform } from './platform.schema'
import { StopLocation } from './stop-location.schema'
import { OptionalId } from './_optional-id.schema'
import { Id } from './_id.schema'

export namespace StopWheelchair {
  @InputType('StopWheelchairInput')
  export abstract class Input {
    @Field()
    boarding: number
  }

  @ObjectType('StopWheelchair')
  export abstract class Output {
    @Field()
    boarding: number
  }
}

export namespace Stop {
  @InputType('StopInput')
  export class Input {
    @Field(() => ID)
    id: string

    @Field({ nullable: true })
    code: string | null

    @Field({ nullable: true })
    name: string

    @Field({ nullable: true })
    description: string

    @Field({ nullable: true })
    url: string

    @Field()
    timezone: string

    @Field(type => StopLocation.Input)
    location: StopLocation.Input

    @Field(type => OptionalId.Input)
    parentStation: OptionalId.Input

    @Field(type => StopWheelchair.Input)
    wheelchair: StopWheelchair.Input

    @Field(type => OptionalId.Input)
    zone: OptionalId.Input

    @Field(type => OptionalId.Input)
    level: OptionalId.Input

    @Field(type => Platform.Input)
    platform: Platform.Input

    @Field(type => Id.Input)
    remote: Id.Input
  }

  @ObjectType('Stop')
  export class Output {
    @Field(() => ID)
    id: string

    @Field({ nullable: true })
    code: string | null

    @Field({ nullable: true })
    name: string

    @Field({ nullable: true })
    description: string

    @Field({ nullable: true })
    url: string

    @Field({nullable:true}) // FIXME: Agency入れてnull排除する
    timezone: string

    @Field(type => StopLocation.Output)
    location: StopLocation.Output

    @Field(type => OptionalId.Output)
    parentStation: OptionalId.Output

    @Field(type => StopWheelchair.Output)
    wheelchair: StopWheelchair.Output

    @Field(type => OptionalId.Output)
    zone: OptionalId.Output

    @Field(type => OptionalId.Output)
    level: OptionalId.Output

    @Field(type => Platform.Output)
    platform: Platform.Output

    @Field(type => Id.Output)
    remote: Id.Output
  }
}
