import { Injectable } from '@nestjs/common';
import axios from 'axios'
import * as  yauzl from 'yauzl'
import * as _ from 'lodash'
import * as stripBomStream from 'strip-bom-stream'
import * as fs from 'fs'
import * as path from 'path'
import * as mkdir from 'mkdirp'
import { createHash } from 'crypto';
import { PythonShell } from 'python-shell'

const gtfsFileNames = ['agency.txt', 'stops.txt', 'routes.txt', 'trips.txt', 'stop_times.txt', 'calendar.txt', 'calendar_dates.txt', 'fare_attributes.txt', 'fare_rules.txt', 'shapes.txt', 'frequencies.txt', 'transfers.txt', 'pathways.txt', 'levels.txt', 'feed_info.txt', 'translations.txt']

@Injectable()
export class GtfsArchiveService {
  async download(url: string, unZipDirPath: string) {
    const { data: zipBuffer } = await axios.get(url, { responseType: 'arraybuffer' })

    const zipHash = createHash('sha256')
      .update(zipBuffer)
      .digest('hex')

    const fileNames = await new Promise<string[]>((res, rej) =>
      yauzl.fromBuffer(
        zipBuffer,
        { lazyEntries: true, autoClose: false },
        (err, zipfile) => {
          if (err) return rej(err)

          const fileNames: string[] = []

          zipfile.on('entry', (entry) => {
            const [fileName] = entry.fileName.split('/').reverse()

            if (gtfsFileNames.includes(fileName) === false) return zipfile.readEntry()

            zipfile.openReadStream(entry, async (err, readStream) => {
              if (err) return rej(err)

              await mkdir(unZipDirPath)

              const file = fs.createWriteStream(path.join(unZipDirPath, fileName), { highWaterMark: 1024 })

              readStream.on('end', () => {
                fileNames.push(fileName)
                zipfile.readEntry()
              })
              readStream.pipe(stripBomStream()).pipe(file)
            })
          })

          zipfile.once('end', () => {
            zipfile.close()

            const requiredFiles: string[] = [
              'agency.txt',
              'stops.txt',
              'routes.txt',
              'trips.txt',
              'stop_times.txt'
            ]

            const conditionallyRequiredFiles: ((fileNames: string[]) => boolean)[] = [
              (fileNames: string[]) => _.intersection(['calendar.txt', 'calendar_dates.txt'], fileNames).length === 0
            ]

            if (
              _.difference(requiredFiles, fileNames).length !== 0 ||
              conditionallyRequiredFiles.some(f => f(fileNames))
            )
              rej(new Error('It is not normal GTFS.'))

            res(fileNames)
          })

          zipfile.readEntry()
        })
    )

    return {
      archive: {
        hash: zipHash
      },
      entry: {
        fileNames
      }
    }
  }

  async upgrade(targetDirPath: string, upgradedDirPath: string): Promise<boolean> {
    return new Promise((res, rej) => {
      PythonShell.run('upgrade_translations.py', {
        pythonPath: '/usr/bin/python2.7',
        mode: 'text',
        args: [targetDirPath, upgradedDirPath]
      }, err => {
        if (err === null) return res(true)

        if (
          err.message === 'KeyError: \'trans_id\'' ||  // NOTE: 新translations.txtの場合
          /^(FileNotFoundError|IOError): \[Errno 2\] No such file or directory: '.+'$/.test(err.message) // NOTE: translations.txtが無い場合
        ) {
          return res(false)
        } else
          return rej(err)
      })
    })
  }
}
