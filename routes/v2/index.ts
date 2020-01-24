import * as config from 'config'
import { Router } from 'express'

import { Config } from '../../app'
import agency from './agency'
import route from './routes'
import stops from './stops'
import translations from './translations'
import trip from './trips'

const router = Router({ mergeParams: true })

router.use('/agency', agency)
router.use('/stops', stops)
router.use('/routes', route)
router.use('/translations', translations)
router.use('/trips', trip)

/**
 * @swagger
 * /{remoteID}:
 *   get:
 *     summary: Info
 *     description: GTFSに関する情報を取得できます
 *     tags:
 *       - Info
 *     parameters:
 *       - $ref: '#/parameters/remoteID'
 *     responses:
 *       200:
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             updated_at:
 *               type: string
 *             license:
 *               type: string
 *               nullable: true
 *             portal:
 *               type: string
 *             static:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                 hash:
 *                   type: string
 *             realtime:
 *               type: object
 *               properties:
 *                 trip_update:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       nullable: true
 *                 vehicle_position:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       nullable: true
 *                 alert:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       nullable: true
 */
router.get('/', async (req, res, next) => {
  const remoteConfig = config.get<Config['remotes']>('remotes')[res.middlelocals.remote.id]

  res.json({
    id: res.middlelocals.remote.id,
    updated_at: res.middlelocals.remote.updatedAt.clone().tz(res.middlelocals.timezone).format(),
    license: remoteConfig.license,
    portal: remoteConfig.portal,
    static: {
      url: remoteConfig.static.url,
      hash: res.middlelocals.remote.hash
    },
    realtime: {
      trip_update: {
        url: remoteConfig.realtime.trip_update.url || null
      },
      vehicle_position: {
        url: remoteConfig.realtime.vehicle_position.url || null
      },
      alert: {
        url: remoteConfig.realtime.alert.url || null
      }
    }
  })
})

export default router
