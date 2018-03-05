"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const csvParser = require("csv-parse");
const translation_1 = require("./GTFS_loader/translation");
const path = './raw_data/';
function readData(path) {
    return new Promise((resolve, reject) => fs_1.readFile(path, (err, data) => err ? reject(err) : resolve(data.toString())));
}
function csv(data) {
    return new Promise(resolve => csvParser(data.substr(11), {
        columns: ['route_num', 'okayama_stop_time', 'delay', 'run', 'passing_stop', 'license_number', 'lat', 'lon', 'first_stop', 'final_stop'], comment: '//'
    }, (err, busesRaw) => resolve(busesRaw.map(bus => bus.passing_stop.substr(13)))));
}
translation_1.default
    .then(stopNames => {
    fs_1.readdir(path, (err, files) => {
        if (err)
            throw err;
        Promise.all(files.map(filePath => readData(path + filePath)))
            .then((data) => __awaiter(this, void 0, void 0, function* () {
            const a = [];
            for (let i = 0; i < data.length; i++) {
                yield csv(data[i]).then(names => names.forEach(name => name.substr(0, 3) !== '《着》' && a.indexOf(name) === -1 ? a.push(name) : null));
            }
            const b = [];
            a.forEach(name => stopNames.delete(name) ? null : b.push(name));
            console.log(b, [...stopNames.keys()]);
            console.log();
        }))
            .catch(err => console.error(err));
    });
});
//# sourceMappingURL=bat.js.map