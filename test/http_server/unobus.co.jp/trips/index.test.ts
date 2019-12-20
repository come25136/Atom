import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../app'
import error from './error'
import trips from './response'
import tripsDetails from './response/details'
import tripsRoute from './response/route'

describe('trips', () => {
  it('/', async () =>
    req(app)
      .get('/v2/unobus.co.jp/trips')
      .expect(200)
      .then(({ body }) => assert.deepEqual(body, trips)))

  it('/?details=true', async () =>
    req(app)
      .get('/v2/unobus.co.jp/trips?details=true')
      .expect(200)
      .then(({ body }) => assert.deepEqual(body, tripsDetails)))

  it('/平日_18時55分_系統1041', async () =>
    req(app)
      .get(
        '/v2/unobus.co.jp/trips/%E5%B9%B3%E6%97%A5_18%E6%99%8255%E5%88%86_%E7%B3%BB%E7%B5%B11041'
      )
      .expect(200)
      .then(({ body }) =>
        assert.deepEqual(body, {
          route_id: '1041',
          service_id: '平日',
          id: '平日_18時55分_系統1041',
          headsign: '八日市',
          short_name: null,
          direction_id: null,
          block_id: null,
          shape_id: '1041',
          wheelchair_sccessible: 0,
          bikes_sllowed: 0
        })
      ))

  it('/平日_18時55分_系統1041/route/2019-10-21?timezone=Asia/Tokyo&detils=true', async () =>
    req(app)
      .get(
        '/v2/unobus.co.jp/trips/%E5%B9%B3%E6%97%A5_18%E6%99%8255%E5%88%86_%E7%B3%BB%E7%B5%B11041/route/2019-10-21?timezone=Asia/Tokyo&details=true'
      )
      .expect(200)
      .then(({ body }) => assert.deepEqual(body, tripsRoute)))

  error()
})
