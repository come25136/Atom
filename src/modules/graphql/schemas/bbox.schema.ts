import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { Location } from './location.schema'

export namespace Bounds {
  @InputType('BoundsInput')
  export class Input {
    @Field(type => Number)
    north: number
    
    @Field(type => Number)
    east: number
    
    @Field(type => Number)
    south: number
    
    @Field(type => Number)
    west: number
  }
}
