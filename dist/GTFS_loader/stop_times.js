"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const csvParser = require("csv-parse");
exports.default = new Promise(resolve => {
    const routes = new Map();
    fs_1.createReadStream('./GTFS/stop_times.txt')
        .pipe(csvParser({ columns: true }, (err, data) => {
        data.forEach(stop => {
            const trip_ids = stop.trip_id.split('_'), type = trip_ids[0] === '平日' ? 'weekday' : 'holiday', id = `${type}_${trip_ids[2].substr(2)}`, time = `${trip_ids[1].substr(0, 2)}:${trip_ids[1].substr(3, 2)}`, stops = routes.get(id);
            routes.set(id, typeof stops === 'undefined'
                ? { [time]: [stop] }
                : stops[time] ? Object.assign(stops, { [time]: [...stops[time], stop] }) : Object.assign(stops, { [time]: [stop] }));
        });
        resolve(routes);
    }));
});
//# sourceMappingURL=stop_times.js.map