"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const csvParser = require("csv-parse");
exports.default = new Promise(resolve => {
    const stops = new Map();
    fs_1.createReadStream('./GTFS/translations.txt')
        .pipe(csvParser({ columns: true }, (err, data) => {
        data.forEach(stop => stops.set(stop.trans_id, Object.assign({ ja: '', 'ja-Hrkt': '', en: '' }, stops.get(stop.trans_id), { [stop.lang]: stop.translation })));
        resolve(stops);
    }));
});
//# sourceMappingURL=translation.js.map