import * as _ from 'lodash'
import * as fs from 'fs'
import * as mkdir from 'mkdirp'
import * as path from 'path'
import * as stripBomStream from 'strip-bom-stream'
import * as yauzl from 'yauzl'
import { ConfigService } from '@nestjs/config/dist/config.service'
import { HttpService, Injectable } from '@nestjs/common'
import { PythonShell } from 'python-shell'
import { createHash } from 'crypto'

import GTFS from '../interfaces/gtfs'

@Injectable()
export class GtfsArchiveService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async download(url: string, unZipDirPath: string) {
    const { data: zipBuffer } = await this.httpService
      .get<Buffer>(url, {
        responseType: 'arraybuffer',
      })
      .toPromise()

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

          zipfile.on('entry', async entry => {
            const [fileName] = entry.fileName.split('/').reverse()

            if (GTFS.FileNames.includes(fileName) === false)
              return zipfile.readEntry()

            await mkdir(unZipDirPath) // TODO: onの外に出す

            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) return rej(err)

              const file = fs.createWriteStream(
                path.join(unZipDirPath, fileName),
                { highWaterMark: 1024 },
              )

              readStream.on('end', () => {
                fileNames.push(fileName)
                zipfile.readEntry()
              })
              readStream.pipe(stripBomStream()).pipe(file)
            })
          })

          zipfile.once('end', () => {
            zipfile.close()

            const conditionallyRequiredFiles: ((
              fileNames: string[],
            ) => boolean)[] = [
              (fileNames: string[]) =>
                _.intersection(
                  ['calendar.txt', 'calendar_dates.txt'],
                  fileNames,
                ).length === 0,
            ]

            if (
              _.difference(GTFS.RequiredFileNames, fileNames).length !== 0 ||
              conditionallyRequiredFiles.some(f => f(fileNames))
            )
              rej(new Error('It is not normal GTFS.'))

            res(fileNames)
          })

          // NOTE: readEntryを呼ぶとentryイベントが発火する
          zipfile.readEntry()
        },
      ),
    )

    return {
      archive: {
        hash: zipHash,
      },
      entry: {
        fileNames,
      },
    }
  }

  // NOTE: upgradedDirPathはPython側で生成されるので、事前生成不必要
  async upgrade(
    sourceDirPath: string,
    upgradedDirPath: string,
  ): Promise<boolean> {
    return new Promise((res, rej) => {
      PythonShell.run(
        'upgrade_translations.py',
        {
          pythonPath: this.configService.get<string>(
            'python.path',
            process.platform === 'win32' ? undefined : '/usr/bin/python2.7',
          ),
          mode: 'text',
          args: [sourceDirPath, upgradedDirPath],
        },
        err => {
          if (err === null) return res(true) // NOTE: アップグレードに成功した場合はtrueを返す

          // NOTE: 既に新形式の場合やファイルが存在しない場合など、アップグレードできない場合はfalseを返す。それ以外はリジェクト
          return err.message === "KeyError: 'trans_id'" || // NOTE: 新translations.txtの場合
            /^(FileNotFoundError|IOError): \[Errno 2\] No such file or directory: '.+'$/.test(
              err.message,
            ) // NOTE: translations.txtが無い場合
            ? res(false)
            : rej(err)
        },
      )
    })
  }
}
