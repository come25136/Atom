import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../app'
import error from './error'
import translations from './response'
import translationsDetails from './response/details'

describe('translations', () => {
  it('/', async () =>
    req(app)
      .get('/v2/unobus.co.jp/translations')
      .expect(200)
      .then(({ body }) => assert.deepEqual(body, translations)))

  it('/?details=true', async () =>
    req(app)
      .get('/v2/unobus.co.jp/translations?details=true')
      .expect(200)
      .then(({ body }) => assert.deepEqual(body, translationsDetails)))

  it('/岡山駅', async () =>
    req(app)
      .get('/v2/unobus.co.jp/translations/%E5%B2%A1%E5%B1%B1%E9%A7%85')
      .expect(200)
      .then(({ body }) =>
        assert.deepEqual(body, {
          ja: '岡山駅',
          'ja-Hrkt': 'おかやまえき',
          en: 'Okayama Sta.'
        })
      ))

  error()
})
