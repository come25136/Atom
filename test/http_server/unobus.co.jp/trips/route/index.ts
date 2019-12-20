import { assert } from 'chai'
import * as req from 'supertest'

import app from '../../../../../app'
import error from './error'
import tripsRoute from './response/'

export default function () {
  it('/平日_18時55分_系統1041/route/2019-10-21?timezone=Asia/Tokyo&detils=true', async () =>
    req(app)
      .get(
        '/v2/unobus.co.jp/trips/%E5%B9%B3%E6%97%A5_18%E6%99%8255%E5%88%86_%E7%B3%BB%E7%B5%B11041/route/2019-10-21?timezone=Asia/Tokyo&details=true'
      )
      .expect(200)
      .then(({ body }) => assert.deepEqual(body, tripsRoute)))

  error()
}
