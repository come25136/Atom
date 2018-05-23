import { promisify } from 'util'

import { readdir, readFileSync } from 'fs'

import { getDataDir } from './util'

const readDir = promisify(readdir)

export interface stations {
  // バス会社名(ディレクトリ名)
  [k: string]: string[]
}

const companies: stations = {}

export default async function() {
  const dirs = await readDir(getDataDir())

  for (let dir of dirs) {
    companies[dir] = JSON.parse(readFileSync(`${getDataDir()}/${dir}/stations.json`, 'utf8')) as string[]
  }

  return companies
}
