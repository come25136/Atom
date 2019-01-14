import * as fs from 'fs'
import { promisify } from 'util'

import { getDataDir } from './util'

const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)

export interface Stations {
  // バス会社名(ディレクトリ名)
  [k: string]: string[]
}

const companies: Stations = {}

export default async function() {
  const dirs = await readDir(getDataDir())

  for (let dir of dirs) {
    if (fs.statSync(`${getDataDir()}/${dir}`).isDirectory() === false) continue

    companies[dir] = JSON.parse(
      await readFile(`${getDataDir()}/${dir}/stations.json`, 'utf8')
    ) as string[]
  }

  return companies
}
