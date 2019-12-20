import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../../app'
import error from './error'
import routesDate from './response/date'
import routesDateDetails from './response/date/details'
import routesDateFirstArrivalTime from './response/date/first_arrival_time'
import routesDateFirstArrivalTimeAndFirstDepartureTime from './response/date/first_arrival_time&first_departure_time'
import routesDateFirstDepartureTime from './response/date/first_departure_time'
import routesGeoJson from './response/geojson'

export default function () {
  describe('route', () => {
    it('/1041', async () =>
      req(app)
        .get('/v2/unobus.co.jp/routes/1041/route/2019-10-21?timezone=Asia/Tokyo')
        .expect(200)
        .then(({ body }) => assert.deepEqual(body, routesDate)))

    it('/1041?timezone=Asia/Tokyo&detils=true', async () =>
      req(app)
        .get('/v2/unobus.co.jp/routes/1041/route/2019-10-21?timezone=Asia/Tokyo&details=true')
        .expect(200)
        .then(({ body }) => assert.deepEqual(body, routesDateDetails)))

    it('/1041?timezone=Asia/Tokyo&detils=true&first_arrival_time=18:55:00', async () =>
      req(app)
        .get(
          '/v2/unobus.co.jp/routes/1041/route/2019-10-21?timezone=Asia/Tokyo&details=true&first_arrival_time=18:55:00'
        )
        .expect(200)
        .then(({ body }) => assert.deepEqual(body, routesDateFirstArrivalTime)))

    it('/1041?timezone=Asia/Tokyo&detils=true&first_departure_time=18:55:00', async () =>
      req(app)
        .get(
          '/v2/unobus.co.jp/routes/1041/route/2019-10-21?timezone=Asia/Tokyo&details=true&first_departure_time=18:55:00'
        )
        .expect(200)
        .then(({ body }) => assert.deepEqual(body, routesDateFirstDepartureTime)))

    it('/1041?timezone=Asia/Tokyo&detils=true&first_arrival_time=18:55:00&first_departure_time=18:55:00', async () =>
      req(app)
        .get(
          '/v2/unobus.co.jp/routes/1041/route/2019-10-21?timezone=Asia/Tokyo&details=true&first_arrival_time=18:55:00&first_departure_time=18:55:00'
        )
        .expect(200)
        .then(({ body }) =>
          assert.deepEqual(body, routesDateFirstArrivalTimeAndFirstDepartureTime)
        ))

    it('/1041/geojson', async () =>
      req(app)
        .get('/v2/unobus.co.jp/routes/1041/geojson')
        .expect(200)
        .then(({ body }) => assert.deepEqual(body, routesGeoJson)))

    error()
  })
}
