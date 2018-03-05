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
const util = require("util");
const superagent = require("superagent");
const csvParse = require("csv-parse");
const _moment = require("moment");
const moment_range_1 = require("moment-range");
const japanese_holidays_1 = require("japanese-holidays");
const stop_times_1 = require("../GTFS_loader/stop_times");
const stops_1 = require("../GTFS_loader/stops");
const translation_1 = require("../GTFS_loader/translation");
const route_1 = require("../libs/route");
const csvParser = util.promisify(csvParse), moment = moment_range_1.extendMoment(_moment);
let cache;
exports.get = () => __awaiter(this, void 0, void 0, function* () {
    const [stopTimes, stops, translations] = yield Promise.all([stop_times_1.default, stops_1.default, translation_1.default]);
    const res = yield superagent.get('http://www3.unobus.co.jp/GPS/unobus.txt');
    let change = false;
    if (!/\/\/LAST/.test(res.text)) {
        const error = new Error('Server side processing is not completed.');
        error.code = 202;
        throw error;
    }
    const date = moment(), time = moment(res.text.substr(1, 8), 'HH:mm:ss');
    if (!cache)
        cache = { time: { latest: time }, data: res.text };
    if (res.text.substr(9) !== cache.data.substr(9)) {
        change = true;
        cache = {
            time: {
                latest: time,
                diff: time.diff(cache.time.latest)
            },
            data: res.text
        };
    }
    const busesRaw = yield csvParser(res.text.substr(11), { columns: ['route_num', 'okayama_stop_time', 'delay', 'run', 'passing_stop', 'license_number', 'lat', 'lon', 'first_stop', 'final_stop'], comment: '//' });
    const day = japanese_holidays_1.isHoliday(moment().toDate()) ? 'holiday' : 'weekday', buses = new Map();
    for (const bus of busesRaw) {
        const first_stop = bus.first_stop.slice(3);
        if (bus.passing_stop.substr(13, 3) !== '《着》') {
            const stops = yield route_1.default(bus.route_num, moment(first_stop.substr(0, 5), 'HH:mm').toISOString());
            let passing = {};
            let next = {};
            const passing_stop_name = (yield translations.get(bus.passing_stop.substr(13))) || { ja: '' };
            stops.forEach(stop => {
                if (Object.keys(passing).length !== 0 && Object.keys(next).length === 0) {
                    next = {
                        name: stop.name,
                        time: stop.time
                    };
                }
                if (passing_stop_name.ja === stop.name.ja) {
                    passing = {
                        name: stop.name,
                        time: stop.time,
                        pass_time: moment(bus.passing_stop.slice(6, 11), 'HH:mm').toISOString()
                    };
                }
            });
            buses.set(bus.license_number, {
                route_num: bus.route_num,
                okayama_stop_time: bus.okayama_stop_time ? moment(bus.okayama_stop_time, 'HH:mm').toISOString() : '',
                delay: bus.delay,
                run: bus.run === '運休' ? false : true,
                license_number: bus.license_number,
                location: {
                    lat: bus.lat,
                    lon: bus.lon
                },
                stops: {
                    first: {
                        name: stops[0].name,
                        time: stops[0].time
                    },
                    passing,
                    next,
                    last: {
                        name: stops[stops.length - 1].name,
                        time: stops[stops.length - 1].time
                    }
                }
            });
        }
    }
    return { change, buses, time: { latest: cache.time.latest, diff: cache.time.diff }, raw: res.text };
});
//# sourceMappingURL=buses.js.map