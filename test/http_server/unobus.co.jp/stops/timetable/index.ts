import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../../app'
import error from './error'
import timetable from './response'

export default function () {
  describe('timetable', () => {
    it('/2_01/timetable', async () =>
      req(app)
        .get('/v2/unobus.co.jp/stops/2_01/timetable/2019-10-21?timezone=Asia/Tokyo')
        .expect(200)
        .then(({ body }) => assert.deepEqual(body, timetable)))

    error()
  })
}
