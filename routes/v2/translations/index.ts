import * as GTFS from '@come25136/gtfs'
import { Router } from 'express'
import * as createHttpError from 'http-errors'
import * as _ from 'lodash'

import { Translation } from '../../../db/entitys/gtfs/translation'
import joi from '../../../libs/joi'

const router = Router({ mergeParams: true })

const rootQuerySchema = joi
  .object()
  .keys({
    details: joi.boolean().default(false)
  })
  .unknown()

/**
 * @swagger
 *
 * definitions:
 *   translation:
 *     type: object
 *     properties:
 *       lang:
 *         type: string
 *
 * /{remoteID}/translations?details=true:
 *   get:
 *     summary: Translations
 *     description: https://developers.google.com/transit/gtfs/reference/gtfs-extensions#translationstxt
 *     tags:
 *       - Translation
 *     parameters:
 *       - $ref: '#/parameters/remoteID'
 *     responses:
 *       200:
 *         schema:
 *           type: object
 *           properties:
 *             trans_id:
 *               $ref: '#/definitions/translation'
*/
router.get('/', (req, res, next) => {
  const queryVR = rootQuerySchema.validate(req.query, {
    abortEarly: false
  })
  if (queryVR.error) return next(queryVR.error)

  if (queryVR.value.details === false)
    return Translation.createQueryBuilder()
      .distinct(true)
      .select('transId')
      .where({ remote: res.middlelocals.remote })
      .getRawMany()
      .then(translations => res.json(translations.map(({ transId }) => transId)))

  Translation.find({ remote: res.middlelocals.remote })
    .then(dbTranslations => {
      if (queryVR.value.details === false) return res.json(dbTranslations)

      const translations: GTFS.Translation = {}

      dbTranslations.forEach(row => {
        translations[row.transId] = {
          ...translations[row.transId],
          [row.lang]: row.translation
        }
      })

      return res.json(translations)
    })
    .catch(next)
})

router.use('/:id', async (req, res, next) =>
  Translation.find({ transId: req.params.id })
    .then(dbTranslations => {
      if (dbTranslations.length === 0) throw createHttpError(404, 'There\'s no translation.')

      res.locals.translations = dbTranslations

      next()
    })
    .catch(next)
)

/**
 * @swagger
 *
 * parameter:
 *   translationID:
 *     in: path
 *     name: translationID
 *     required: true
 *     type: string
 *
 * /{remoteID}/translations/{translationID}:
 *   get:
 *     summary: Translations
 *     description: https://developers.google.com/transit/gtfs/reference/gtfs-extensions#translationstxt
 *     tags:
 *       - Translation
 *     parameters:
 *       - $ref: '#/parameters/remoteID'
 *       - $ref: '#/parameters/translationID'
 *     responses:
 *       200:
 *         schema:
 *           $ref: '#/definitions/translation'
*/
router.get('/:id', (req, res, next) => {
  const langs: { [lang: string]: string } = {}

  res.locals.translations.forEach(trans => (langs[trans.lang] = trans.translation))

  res.json(langs)
})

export default router
