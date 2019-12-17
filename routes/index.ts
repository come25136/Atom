import { Router } from 'express'
import * as createHttpError from 'http-errors'

import { Remote } from '../db/entitys/gtfs/remote'
import { getGtfes } from '../stores'
import v2 from './v2'

const router = Router({ mergeParams: true })

/**
 * @swagger
 *
 * parameter:
 *   remoteID:
 *     in: path
 *     name: remoteID
 *     required: true
 *     type: string
 *
 *   date:
 *     in: path
 *     name: date
 *     required: true
 *     type: string
 *
 * /:
 *   get:
 *     summary: Remote ID list
 *     description: サーバーが対応しているGTFSの独自固有ID
 *     responses:
 *       200:
 *         schema:
 *           type: array
 *           items:
 *             type: string
 */
router.get('/v2', async (req, res) =>
  getGtfes().then(remotes => res.json(remotes.map(({ id }) => id)))
)

router.use(
  '/v2/:remoteId',
  async (req, res, next) =>
    Remote.findOne({ id: req.params.remoteId })
      .then(remote => {
        if (remote === undefined) throw createHttpError(404, 'There\'s no remote ID.')

        res.middlelocals = {
          remote,
          timezone: req.query.timezone || 'utc'
        }

        next()
      })
      .catch(next),
  v2
)

export default router
