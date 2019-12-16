import { GTFS } from '@come25136/gtfs'
import * as config from 'config'
import { createHash } from 'crypto'
import { appendFileSync } from 'fs'
import * as _ from 'lodash'
import * as superagent from 'superagent'
import { getManager } from 'typeorm'

import { Remote } from '..//db/entitys/gtfs/remote'
import { Remotes as ConfigRemotes } from '../libs/get_data/loop_get_data'
import logger from '../libs/logger'
import { debug } from '../libs/util'

export async function importGtfsToDb(id: string): Promise<void> {
  const configRemote = config.get<ConfigRemotes>('remotes')[id]

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

      appendFileSync(`save_data/${remote.id}_${hash}.zip`, zipBuffer)

      await remoteRepo.delete({ uid: remote.uid })
    }

    await Remote.import(id, gtfs, hash, trn)

    logger.debug(`Import of GTFS static for remote ID '${id}' success.`)
  })
}

export async function getGtfes(remoteId?: string): Promise<Remote[]> {
  return await Remote.find(remoteId ? { where: { id: remoteId }, take: 1 } : null)
}
