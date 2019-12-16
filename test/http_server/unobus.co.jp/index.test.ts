import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../app'
import routesDate from './data/routes/date'
import routesDateDetails from './data/routes/date/details'
import routesDateFirstArrivalTime from './data/routes/date/first_arrival_time'
import routesDateFirstArrivalTimeAndFirstDepartureTime from './data/routes/date/first_arrival_time&first_departure_time'
import routesDateFirstDepartureTime from './data/routes/date/first_departure_time'
import routesGeoJson from './data/routes/geojson'
import stops from './data/stops'
import stops2_01TimeTable from './data/stops/2_01/timetable'
import stopsDetails from './data/stops/details'
import translations from './data/translations'
import translationsDetails from './data/translations/details'
import trips from './data/trips'
import tripsDetails from './data/trips/details'
import tripsRoute from './data/trips/route'

describe('unobus.co.jp', () => {
  describe('routes', () => {
    it('/', async () =>
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
    })
  })

  describe('stops', () => {
    it('/', async () =>
      req(app)
        .get('/v2/unobus.co.jp/stops')
        .expect(200)
        .then(({ body }) => assert.deepEqual(body, stops)))

    it('/?details=true', async () =>
      req(app)
        .get('/v2/unobus.co.jp/stops?details=true')
        .expect(200)
        .then(({ body }) => assert.deepEqual(body, stopsDetails)))

    it('/2_01', async () =>
      req(app)
        .get('/v2/unobus.co.jp/stops/2_01')
        .expect(200)
        .then(({ body }) =>
          assert.deepEqual(body, {
            id: '2_01',
            code: null,
            name: '岡山駅',
            description: null,
            location: {
              type: 0,
              lat: 34.6650806666667,
              lon: 133.918666571428
            },
            zone: {
              id: '2_01'
            },
            url: 'http://unobus.bustei.net/b.htm?T=0002',
            parent_station: null,
            timezone: null,
            wheelchair_boarding: 0,
            level: {
              id: null
            },
            platform_code: null
          })
        ))

    it('/2_01/timetable', async () =>
      req(app)
        .get('/v2/unobus.co.jp/stops/2_01/timetable/2019-10-21?timezone=Asia/Tokyo')
        .expect(200)
        .then(({ body }) => assert.deepEqual(body, stops2_01TimeTable)))

    it('Out of service range.', async () =>
      req(app)
        .get('/v2/unobus.co.jp/stops/2_01/timetable/2000-01-01')
        .expect(404)
        .then(({ body }) =>
          assert.deepEqual(body, {
            error: [
              {
                message: 'There\'s no service ID.'
              }
            ]
          })
        ))

    describe('Not found', () => {
      it('/null', async () =>
        req(app)
          .get('/v2/unobus.co.jp/stops/null')
          .expect(404)
          .then(({ body }) =>
            assert.deepEqual(body, {
              error: [
                {
                  message: 'There\'s no stop.'
                }
              ]
            })
          ))

      it('/null/timetable', async () =>
        req(app)
          .get('/v2/unobus.co.jp/stops/null/timetable/2019-10-21')
          .expect(404)
          .then(({ body }) =>
            assert.deepEqual(body, {
              error: [
                {
                  message: 'There\'s no stop.'
                }
              ]
            })
          ))
    })
  })

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

    describe('Not found', () => {
      it('/null', async () =>
        req(app)
          .get('/v2/unobus.co.jp/translations/null')
          .expect(404)
          .then(({ body }) =>
            assert.deepEqual(body, {
              error: [
                {
                  message: 'There\'s no translation.'
                }
              ]
            })
          ))
    })
  })

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

    describe('Not found', () => {
      it('/null', async () =>
        req(app)
          .get('/v2/unobus.co.jp/trips/null')
          .expect(404)
          .then(({ body }) =>
            assert.deepEqual(body, {
              error: [
                {
                  message: 'There\'s no trip.'
                }
              ]
            })
          ))
    })
  })
})
