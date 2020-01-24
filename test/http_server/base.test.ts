import { GTFS } from '@come25136/gtfs'
import { assert } from 'chai'
import { readFile } from 'fs'
import * as req from 'supertest'
import { Connection, createConnection, getManager } from 'typeorm'
import { promisify } from 'util'

import app from '../../app'
import { Remote } from '../../db/entitys/gtfs/remote'

const readFileAsync = promisify(readFile)

let dbConnection: Connection

before(async function () {
  this.timeout(300000)

  dbConnection = await createConnection()

  return readFileAsync(`${__dirname}/../../../test_data/unobus.co.jp.zip`)
    .then(GTFS.importZipBuffer)
    .then(async gtfs =>
      getManager().transaction(async trn =>
        Remote.import(
          'unobus.co.jp',
          gtfs,
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          trn
        ))
    )
})

after(async () => dbConnection.close())

describe('swagger ui', () => {
  it('document', async () =>
    req(app)
      .get('/')
      .expect(200))
})

describe('remote ids', () => {
  it('list', async () =>
    req(app)
      .get('/v2')
      .expect(200)
      .then(({ body }) => assert.sameMembers(body, ['unobus.co.jp'])))

  describe('Not found', () => {
    it('/null', async () =>
      req(app)
        .get('/v2/null')
        .expect(404)
        .then(({ body }) =>
          assert.deepEqual(body, {
            error: [
              {
                message: 'There\'s no remote ID.'
              }
            ]
          })
        )
    )
  })

  describe('info', () => {
    it('unobus.co.jp', async () => {
      const remote = await Remote.findOne({ id: 'unobus.co.jp' })

      return req(app)
        .get('/v2/unobus.co.jp/?timezone=Asia/Tokyo')
        .expect(200)
        .then(({ body }) =>
          assert.deepEqual(body, {
            id: 'unobus.co.jp',
            updated_at: remote.updatedAt.clone().tz('Asia/Tokyo').format(),
            license: 'CC0 1.0',
            portal: 'http://www3.unobus.co.jp/opendata',
            static: {
              url: 'http://www3.unobus.co.jp/opendata/GTFS-JP.zip',
              hash: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
            },
            realtime: {
              trip_update: {
                url: 'http://www3.unobus.co.jp/GTFS/GTFS_RT.bin'
              },
              vehicle_position: {
                url: 'http://www3.unobus.co.jp/GTFS/GTFS_RT-VP.bin'
              },
              alert: {
                url: 'http://www3.unobus.co.jp/GTFS/GTFS_RT-Alert.bin'
              }
            }
          })
        )
    })
  })
})
