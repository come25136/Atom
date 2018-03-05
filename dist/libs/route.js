"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const japanese_holidays_1 = require("japanese-holidays");
const translation_1 = require("../GTFS_loader/translation");
const stops_1 = require("../GTFS_loader/stops");
const stop_times_1 = require("../GTFS_loader/stop_times");
let cache;
exports.default = (line, date) => new Promise(resolve => {
    cache
        ? getSteps()
        : Promise.all([translation_1.default, stops_1.default, stop_times_1.default,])
            .then(data => {
            cache = data;
            getSteps();
        });
    function getSteps() {
        const [translations, stops, stopTimes] = cache, _date = moment(date), routes = stopTimes.get(`${_date.day() === 0 || _date.day() === 6 || japanese_holidays_1.isHoliday(_date.toDate()) ? 'holiday' : 'weekday'}_${line}`);
        if (!routes)
            return;
        const _time = _date.format('HH:mm');
        if (!routes[_time])
            console.log(routes);
        resolve(routes[_time].map(stop_raw => {
            const stop = stops.get(stop_raw.stop_id) || {
                stop_name: '',
                stop_lat: 0,
                stop_lon: 0
            };
            return {
                name: Object.assign({ ja: '', 'ja-Hrkt': '', en: '' }, translations.get(stop.stop_name)),
                time: moment(stop_raw.arrival_time, 'HH:mm:ss').toISOString(),
                lat: stop.stop_lat,
                lon: stop.stop_lon
            };
        }));
    }
});
//# sourceMappingURL=route.js.map