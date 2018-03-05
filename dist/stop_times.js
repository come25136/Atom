"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const csvParser = require("csv-parse");
class stopTimes {
    constructor() {
        this.stopTimes = new Map();
        fs_1.createReadStream('./GTFS/stop_times.txt')
            .pipe(csvParser({ columns: true }, (err, data) => {
            data.forEach(stop => {
                const trip_ids = stop.trip_id.split('_'), type = trip_ids[0] === '平日' ? 'weekday' : 'holiday', id = `${type}_${trip_ids[1].substr(0, 2)}:${trip_ids[1].substr(3, 2)}_${trip_ids[2].substr(2)}`, stops = this.stopTimes.get(id);
                console.log(typeof stops);
                this.stopTimes.set(id, typeof stops === 'undefined' ? [stop] : [...stops, stop]);
            });
        }));
    }
}
exports.default = stopTimes;
//# sourceMappingURL=stop_times.js.map