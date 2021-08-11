import { Field, ID, InputType, ObjectType } from "@nestjs/graphql"
import { GraphQLInt, GraphQLString } from "graphql"
import { Id } from "./_id.schema"
import { OptionalId } from "./_optional-id.schema"

export namespace Trip {
  @ObjectType('Trip')
  export abstract class Output {
    @Field(type => Id.Output)
    route: Id.Output

    @Field(type => Id.Output)
    service: Id.Output

    @Field(type => ID)
    id: string

    @Field(type => GraphQLString, { nullable: true })
    headsign: string

    @Field(type => GraphQLString, { nullable: true })
    name: string

    @Field(type => OptionalId.Output)
    direction: OptionalId.Output

    @Field(type => OptionalId.Output)
    block: OptionalId.Output

    @Field(type => OptionalId.Output)
    shape: OptionalId.Output

    @Field(type => GraphQLInt, { nullable: true })
    wheelchair_accessible: number // FIXME: accessible.wheelchairにする

    @Field(type => GraphQLInt, { nullable: true })
    bikes_allowed: number // FIXME: allowed.bikes
  }
}
