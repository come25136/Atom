import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../../app'

export default function () {
  describe('Not found', () => {
    it('/0000', async () =>
      req(app)
        .get('/v2/unobus.co.jp/routes/0000')
        .expect(404)
        .then(({ body }) =>
          assert.deepEqual(body, {
            error: [
              {
                message: 'There\'s no route.'
              }
            ]
          })
        ))

    it('/0000?detils=true', async () =>
      req(app)
        .get('/v2/unobus.co.jp/routes/0000/route/2019-10-21?details=true')
        .expect(404)
        .then(({ body }) =>
          assert.deepEqual(body, {
            error: [
              {
                message: 'There\'s no route.'
              }
            ]
          })
        ))

    it('/1041?detils=true&first_arrival_time=18:55:01', async () =>
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

    it('/1041?detils=true&first_departure_time=18:55:01', async () =>
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

    it('/1041?detils=true&first_arrival_time=18:55:01&first_departure_time=18:55:00', async () =>
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

    it('/1041?detils=true&first_arrival_time=18:55:00&first_departure_time=18:55:01', async () =>
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

    it('/1041?detils=true&first_arrival_time=18:55:01&first_departure_time=18:55:01', async () =>
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

    it('/0000/geojson', async () =>
      req(app)
        .get('/v2/unobus.co.jp/routes/0000/geojson')
        .expect(404)
        .then(({ body }) =>
          assert.deepEqual(body, {
            error: [
              {
                message: 'There\'s no route.'
              }
            ]
          })
        ))
  })
}
