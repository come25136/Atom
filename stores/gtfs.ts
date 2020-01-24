import { GTFS } from '@come25136/gtfs'
import * as config from 'config'
import { createHash } from 'crypto'
import * as env from 'env-var'
import { appendFileSync } from 'fs'
import * as _ from 'lodash'
import * as superagent from 'superagent'
import { getManager } from 'typeorm'

import { Config } from '../app'
import { Agency } from '../db/entitys/gtfs/agency'
import { Calendar } from '../db/entitys/gtfs/calendar'
import { CalendarDate } from '../db/entitys/gtfs/calendar_date'
import { FareAttribute } from '../db/entitys/gtfs/fare_attribute'
import { FareRule } from '../db/entitys/gtfs/fare_rule'
import { FeedInfo } from '../db/entitys/gtfs/feed_info'
import { Frequency } from '../db/entitys/gtfs/frequency'
import { Level } from '../db/entitys/gtfs/level'
import { Pathway } from '../db/entitys/gtfs/pathway'
import { Remote } from '../db/entitys/gtfs/remote'
import { Route } from '../db/entitys/gtfs/route'
import { Shape } from '../db/entitys/gtfs/shape'
import { Stop } from '../db/entitys/gtfs/stop'
import { StopTime } from '../db/entitys/gtfs/stop_time'
import { Transfer } from '../db/entitys/gtfs/transfer'
import { Translation } from '../db/entitys/gtfs/translation'
import { Trip } from '../db/entitys/gtfs/trip'
import logger from '../libs/logger'
import { debug } from '../libs/util'

export async function importGtfsToDb(id: string): Promise<void> {
  const configRemote = config.get<Config['remotes']>('remotes')[id]

  debug(() => console.time('download time'))
  const { body: zipBuffer } = await superagent(configRemote.static.url).responseType('blob')
  debug(() => console.timeEnd('download time'))

  logger.debug(`Download of static for remote ID '${id}' success.`)

  const hash = createHash('sha256')
    .update(zipBuffer)
    .digest('hex')

  debug(() => console.time('load time'))
  const gtfs = await GTFS.importZipBuffer(zipBuffer)
  debug(() => console.timeEnd('load time'))

  logger.debug(`Load of GTFS static for remote ID '${id}' success.`)

  await getManager().transaction(async trn => {
    const remoteRepo = trn.getRepository(Remote)

    const remote = await remoteRepo.findOne({ id })

    if (remote !== undefined) {
      if (remote.hash === hash)
        return logger.debug(`Not imported because the hash of remote ID '${id}' matches.`)

      logger.debug(hash)
      logger.debug(configRemote)

      if (env.get('SAVE_STATIC_DATA', 'false').asBoolStrict()) appendFileSync(`save_data/${remote.id}_${hash}.zip`, zipBuffer)

      // TODO: 他に良い方法があればそれにする
      await trn.createQueryBuilder().delete().from(Frequency).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
      await trn.createQueryBuilder().delete().from(StopTime).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
      await trn.createQueryBuilder().delete().from(Trip).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
      await trn.createQueryBuilder().delete().from(CalendarDate).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
      await trn.createQueryBuilder().delete().from(Calendar).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
      await trn.createQueryBuilder().delete().from(FareRule).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
      await trn.createQueryBuilder().delete().from(Route).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
      await trn.createQueryBuilder().delete().from(FareAttribute).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
      await trn.createQueryBuilder().delete().from(Agency).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
      await trn.createQueryBuilder().delete().from(Pathway).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
      await trn.createQueryBuilder().delete().from(Transfer).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
      await trn.createQueryBuilder().delete().from(Translation).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
      await trn.createQueryBuilder().delete().from(Stop).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
      await trn.createQueryBuilder().delete().from(Level).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
      await trn.createQueryBuilder().delete().from(Shape).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
      await trn.createQueryBuilder().delete().from(FeedInfo).where('remoteUid = :remoteUid', { remoteUid: remote.uid }).execute()
    }

    await Remote.import(id, gtfs, hash, trn)

    logger.debug(`Import of GTFS static for remote ID '${id}' success.`)
  })
}

export async function getGtfes(remoteId?: string): Promise<Remote[]> {
  return await Remote.find(remoteId ? { where: { id: remoteId }, take: 1 } : null)
}
