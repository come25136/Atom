import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../app'
import error from './error'
import stops from './response'
import stopsDetails from './response/details'
import timetable from './timetable'

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

  timetable()

  error()
})
