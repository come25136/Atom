import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../../app'
import error from './error'
import geojson from './response'

export default function () {
  describe('geojson', () => {
    it('/1041/geojson', async () =>
      req(app)
        .get('/v2/unobus.co.jp/routes/1041/geojson')
        .expect(200)
        .then(({ body }) => assert.deepEqual(body, geojson)))

    error()
  })
}
