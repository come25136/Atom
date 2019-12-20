import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../../app'

export default function () {
  describe('Not found', () => {
    it('/1041/route?detils=true&first_arrival_time=18:55:01', async () =>
      req(app)
        .get(
          '/v2/unobus.co.jp/routes/1041/route/2019-10-21?details=true&first_arrival_time=18:55:01'
        )
        .expect(404)
        .then(({ body }) =>
          assert.deepEqual(body, {
            error: [
              {
                message: 'There\'s trip has no route.'
              }
            ]
          })
        ))

    it('/1041/route?detils=true&first_departure_time=18:55:01', async () =>
      req(app)
        .get(
          '/v2/unobus.co.jp/routes/1041/route/2019-10-21?details=true&first_departure_time=18:55:01'
        )
        .expect(404)
        .then(({ body }) =>
          assert.deepEqual(body, {
            error: [
              {
                message: 'There\'s trip has no route.'
              }
            ]
          })
        ))

    it('/1041/route?detils=true&first_arrival_time=18:55:01&first_departure_time=18:55:00', async () =>
      req(app)
        .get(
          '/v2/unobus.co.jp/routes/1041/route/2019-10-21?details=true&first_arrival_time=18:55:01&first_departure_time=18:55:00'
        )
        .expect(404)
        .then(({ body }) =>
          assert.deepEqual(body, {
            error: [
              {
                message: 'There\'s trip has no route.'
              }
            ]
          })
        ))

    it('/1041/route?detils=true&first_arrival_time=18:55:00&first_departure_time=18:55:01', async () =>
      req(app)
        .get(
          '/v2/unobus.co.jp/routes/1041/route/2019-10-21?details=true&first_arrival_time=18:55:00&first_departure_time=18:55:01'
        )
        .expect(404)
        .then(({ body }) =>
          assert.deepEqual(body, {
            error: [
              {
                message: 'There\'s trip has no route.'
              }
            ]
          })
        ))

    it('/1041/route?detils=true&first_arrival_time=18:55:01&first_departure_time=18:55:01', async () =>
      req(app)
        .get(
          '/v2/unobus.co.jp/routes/1041/route/2019-10-21?details=true&first_arrival_time=18:55:01&first_departure_time=18:55:01'
        )
        .expect(404)
        .then(({ body }) =>
          assert.deepEqual(body, {
            error: [
              {
                message: 'There\'s trip has no route.'
              }
            ]
          })
        ))
  })
}
