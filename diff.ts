import { readdir, readFile } from "fs";

import * as csvParser from "csv-parse";

import translation from "./GTFS_loader/translation";

interface IbusRaw {
  route_num: number;
  okayama_stop_time: string;
  delay: number;
  run: string;
  passing_stop: string;
  license_number: number;
  lat: number;
  lon: number;
  first_stop: string;
  final_stop: string;
}

const path = "./raw_data/";

function readData(path: string) {
  return new Promise<string>((resolve, reject) =>
    readFile(
      path,
      (err, data) => (err ? reject(err) : resolve(data.toString()))
    )
  );
}

function csv(data: string) {
  return new Promise<string[]>(resolve =>
    csvParser(
      data.substr(11),
      {
        columns: [
          "route_num",
          "okayama_stop_time",
          "delay",
          "run",
          "passing_stop",
          "license_number",
          "lat",
          "lon",
          "first_stop",
          "final_stop"
        ],
        comment: "//"
      },
      (err: Error, busesRaw: IbusRaw[]) =>
        // resolve(busesRaw.map(bus => bus.first_stop.substr(9))))
        resolve(busesRaw.map(bus => bus.passing_stop.substr(13)))
    )
  );
}

translation.then(stopNames => {
  readdir(path, (err, files) => {
    if (err) throw err;

    Promise.all(files.map(filePath => readData(path + filePath)))
      .then(async data => {
        const a: string[] = [];

        for (let i = 0; i < data.length; i++) {
          await csv(data[i]).then(names =>
            names.forEach(
              name =>
                name.substr(0, 3) !== "《着》" && a.indexOf(name) === -1
                  ? a.push(name)
                  : null
            )
          );
        }

        const b: string[] = [];

        a.forEach(name => (stopNames.delete(name) ? null : b.push(name)));

        console.log(b, [...stopNames.keys()]);
        console.log();
      })
      .catch(err => console.error(err));
  });
});
