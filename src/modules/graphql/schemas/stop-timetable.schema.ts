import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { GraphQLFloat, GraphQLInt, GraphQLString } from "graphql"
import { Trip } from "./trip.schema"
import { Id } from "./_id.schema"

export namespace StopTImetable {
  @ObjectType('StopTimetable')
  export abstract class Output {
    @Field(type => Trip.Output)
    trip: Id.Output

    @Field(type => GraphQLString, { nullable: true })
    arrival_time: string

    @Field(type => GraphQLString, { nullable: true })
    departure_time: string

    @Field(type => GraphQLString, { nullable: true })
    headsign: string

    @Field(type => GraphQLInt, { nullable: true })
    pickup_type: number

    @Field(type => GraphQLInt, { nullable: true })
    drop_off_type: number

    @Field(type => GraphQLInt, { nullable: true })
    continuous_pickup: number

    @Field(type => GraphQLInt, { nullable: true })
    continuous_drop_off: number

    @Field(type => GraphQLFloat, { nullable: true })
    shape_dist_traveled: number

    @Field(type => GraphQLInt, { nullable: true })
    timepoint: number
  }
}
