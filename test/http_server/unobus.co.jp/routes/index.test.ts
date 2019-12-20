import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../app'
import routes from './response'
import routesDetails from './response/details'
import route from './route'

describe('routes', () => {
  it('/', async () =>
    req(app)
      .get('/v2/unobus.co.jp/routes/')
      .expect(200)
      .then(({ body }) =>
        assert.deepEqual(body, routes)
      ))

  it('/?details=true', async () =>
    req(app)
      .get('/v2/unobus.co.jp/routes?details=true')
      .expect(200)
      .then(({ body }) =>
        assert.deepEqual(body, routesDetails)
      ))

  it('/1041', async () =>
    req(app)
      .get('/v2/unobus.co.jp/routes/1041/')
      .expect(200)
      .then(({ body }) =>
        assert.deepEqual(body, {
          type: 3,
          id: '1041',
          name: {
            short: '250号線[1041]',
            long: '250号線[1041]'
          },
          description: '岡山駅→八日市',
          color: '9C4E1F',
          text: {
            color: 'FFFFFF'
          }
        })
      ))

  route()
})
