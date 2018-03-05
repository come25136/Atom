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
const http_1 = require("http");
const express = require("express");
const socketIo = require("socket.io");
const geolib_1 = require("geolib");
const _moment = require("moment");
const moment_range_1 = require("moment-range");
const route_1 = require("./libs/route");
const unobus = require("./libs/unobus");
process.chdir(process.argv[2] === 'true' ? process.cwd() : './');
const moment = moment_range_1.extendMoment(_moment), app = express(), port = process.env.PORT || 3000, server = new http_1.Server(app), io = socketIo(server);
app.disable('x-powered-by');
const times = [6000];
let busesCache;
const accessTime = moment.range(moment('1:30', 'H:mm'), moment('6:30', 'H:mm'));
function getBusLoop() {
    return __awaiter(this, void 0, void 0, function* () {
        if (accessTime.contains(moment()))
            return setTimeout(getBusLoop, moment('6:30', 'H:mm').diff(moment()));
        try {
            const { change, buses, time } = yield unobus.get();
            if (100 < times.length)
                times.shift();
            if (time.diff)
                times.push(time.diff);
            if (times.length === 1 || buses.size === 0 || (busesCache && busesCache.size === 0 && buses.size === 0))
                return setTimeout(getBusLoop, times[0]);
            if (change) {
                if (busesCache && busesCache.values().next().value.license_number === buses.values().next().value.license_number) {
                    console.log('\nmoved!!');
                    console.log(`[${String(buses.values().next().value.license_number).substr(0, 2)}-${String(buses.values().next().value.license_number).substr(2, 2)}]`);
                    console.log(times[times.length - 1] / 1000 + 's');
                    const distance = geolib_1.getDistance({ latitude: busesCache.values().next().value.location.lat, longitude: busesCache.values().next().value.location.lon }, { latitude: buses.values().next().value.location.lat, longitude: buses.values().next().value.location.lon });
                    console.log(distance + 'm');
                    console.log(distance === 0 ? '0km/h\n' : (distance / 1000 / (times[times.length - 1] / 1000) * 3600).toFixed(5) + 'km/h\n');
                }
                busesCache = buses;
                io.of('unobus').emit('unobus', [...buses.values()]);
            }
            const awaitTime = time.latest.add(times.reduce((prev, current) => prev + current) / times.length, 'ms').diff(moment());
            console.log(`It gets the data after ${(awaitTime <= 0 ? 3000 : awaitTime) / 1000} seconds`);
            setTimeout(getBusLoop, awaitTime <= 0 ? 3000 : awaitTime);
        }
        catch (err) {
            console.log(err);
            setTimeout(getBusLoop, 1000);
        }
    });
}
io.of('unobus').on('connection', () => busesCache ? io.emit('unobus', [...busesCache.values()]) : null);
getBusLoop();
app.get('/route/:lineNum/:date', (req, res) => route_1.default(req.params.lineNum, req.params.date).then(stops => res.json(stops)));
server.listen(port, () => console.log(`UnoBus API wrap WebSocket server | port: ${port}`));
//# sourceMappingURL=app.js.map