import { promisify } from 'util'

import * as fs from 'fs'

import { getDataDir } from './util'

const readDir = promisify(fs.readdir),
  readFile = promisify(fs.readFile)

export interface stations {
  // バス会社名(ディレクトリ名)
  [k: string]: string[]
}

const companies: stations = {}

export default async function() {
  const dirs = await readDir(getDataDir())

  for (let dir of dirs) {
    if (fs.statSync(`${getDataDir()}/${dir}`).isFile()) continue

    companies[dir] = JSON.parse(
      await readFile(`${getDataDir()}/${dir}/stations.json`, 'utf8')
    ) as string[]
  }

  return companies
}
