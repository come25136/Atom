import { promisify } from 'util'

import * as fs from 'fs'

import * as csvParse from 'csv-parse'

import { getDataDir } from '../util'

export interface Ishape {
  shape_id: string
  shape_pt_lat: number
  shape_pt_lon: number
  shape_pt_sequence: number
  shape_dist_traveled?: number
}

export interface Ishapes {
  [k: string]: {
    [k: string]: Ishape[]
  }
}

const readDir = promisify(fs.readdir),
  readFile = promisify(fs.readFile),
  csvParser = promisify<string, csvParse.Options, Ishape[]>(csvParse)

const companies: Ishapes = {}

export default async function() {
  if (Object.keys(companies).length) return companies

  const dirs = await readDir(getDataDir())

  for (let dir of dirs) {
    if (fs.statSync(`${getDataDir()}/${dir}`).isFile()) continue

    const shapes: { [k: string]: Ishape[] } = {},
      rows = await csvParser(
        await readFile(`${getDataDir()}/${dir}/gtfs/shapes.txt`, 'utf8').catch(() => ''),
        {
          columns: true
        }
      )

    rows.forEach(shape => {
      if (!shapes[shape.shape_id]) shapes[shape.shape_id] = []
      shapes[shape.shape_id].push({
        shape_id: shape.shape_id,
        shape_pt_lat: Number(shape.shape_pt_lat),
        shape_pt_lon: Number(shape.shape_pt_lon),
        shape_pt_sequence: Number(shape.shape_pt_sequence),
        shape_dist_traveled: shape.shape_dist_traveled
          ? Number(shape.shape_dist_traveled)
          : undefined
      })
    })

    for (const stops of Object.values(shapes))
      stops.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence)

    companies[dir] = shapes
  }

  return companies
}
