import { Field, Float, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Location } from './location.schema'
import { Id } from './_id.schema'

export namespace Descriptors {
  @ObjectType('Descriptors')
  export class Output {
    @Field(type => ID)
    id: string

    @Field({ nullable: true })
    label: string

    @Field({ nullable: true })
    licensePlate: string
  }
}

export namespace Vehicle {
  @ObjectType('Vehicle')
  export class Output {
    @Field(type => Id.Output)
    remote: Id.Output

    @Field(type => Descriptors.Output)
    descriptors: string

    @Field(type => Location.Output)
    location: Location.Output

    @Field(type => Float)
    progress: number
  }
}
