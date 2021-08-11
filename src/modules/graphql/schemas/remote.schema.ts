import { Field, ID, InputType, ObjectType } from '@nestjs/graphql'

import { Crawl } from './crawl.schema'
import { Display } from './display.schema'
import { FetchedData } from './fetched-data.schema'
import { FetchedGTFSRTs } from './fetched-gtfs-rts.schema'
import { License } from './license.schema'
import { URL } from './url.schema'

export namespace Remote {
  @InputType('RemoteInput')
  export class Input {
    @Field(() => ID)
    id: string

    @Field(type => Display.Input)
    display: Display.Input

    @Field(type => URL.Input)
    portal: URL.Input

    @Field(type => License.Input)
    license: License.Input

    @Field(type => FetchedData.Input)
    static: FetchedData.Input

    @Field(type => FetchedGTFSRTs.Input)
    realtime: FetchedGTFSRTs.Input
  }

  @ObjectType('Remote')
  export class Output {
    @Field(() => ID)
    id: string

    @Field(type => Crawl.Output)
    crawl: Crawl.Output

    @Field(type => Display.Output)
    display: Display.Output

    @Field(type => URL.Output)
    portal: URL.Output

    @Field(type => License.Output)
    license: License.Output

    @Field(type => FetchedData.Output)
    static: FetchedData.Output

    @Field(type => FetchedGTFSRTs.Output)
    realtime: FetchedGTFSRTs.Output
  }
}
