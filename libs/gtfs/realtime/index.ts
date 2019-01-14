import { Reader, Root } from 'protobufjs'

import { FeedMessage } from './feed'

export * from './feed'
export * from './incrementality'
export * from './schedule'
export * from './stop'
export * from './trip'
export * from './vehicle'

export async function decode(data: Reader | Uint8Array): Promise<FeedMessage> {
  let proto: Root | null = null

  if (proto === null)
    proto = await new Root().load('libs/gtfs/realtime/gtfs-realtime.proto', { keepCase: true })

  const feed = proto.lookupType('transit_realtime.FeedMessage')

  return (feed.toObject(feed.decode(data), { longs: Number }) as any) as FeedMessage
}
