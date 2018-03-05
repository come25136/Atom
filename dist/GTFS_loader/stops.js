"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const csvParser = require("csv-parse");
exports.default = new Promise(resolve => {
    const stops = new Map();
    fs_1.createReadStream('./GTFS/stops.txt')
        .pipe(csvParser({ columns: true }, (err, data) => {
        data.forEach(stop => stops.set(stop.stop_id, stop));
        resolve(stops);
    }));
});
//# sourceMappingURL=stops.js.map