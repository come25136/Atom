import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../../app'

export default function () {
  describe('Not found', () => {
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
