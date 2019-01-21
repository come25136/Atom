import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../app'

describe('api blueprint', () => {
  it('api.html', async () =>
    req(app)
      .get('/')
      .expect(200))
})

describe('companies', () => {
  it('list', async () =>
    req(app)
      .get('/v1')
      .expect(200)
      .then(({ body }) => assert.sameMembers(body, ['unobus', 'ryobibus', 'shimodenbus'])))

  describe('agency', () => {
    it('unobus', async () =>
      req(app)
        .get('/v1/unobus')
        .expect(200)
        .then(({ body }) =>
          assert.deepEqual(body, {
            id: '1260001000674',
            name: '宇野自動車株式会社',
            url: 'http://www.unobus.co.jp/',
            timezone: 'Asia/Tokyo',
            lang: 'ja',
            phone: '086-225-3311'
          })
        ))

    it('404', () =>
      req(app)
        .get('/v1/null')
        .expect(404))
  })

  describe('stops', () => {
    it('404', () =>
      req(app)
        .get('/v1/null/stops')
        .expect(404))

    describe('timetable', () => {
      it('404', () =>
        req(app)
          .get('/v1/null/stops/null/timetable')
          .expect(404))
    })
  })
})
