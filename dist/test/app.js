"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioClient = require("socket.io-client");
const socket = ioClient('http://localhost:3001');
socket.on('connect', () => console.log('connect'));
socket.on('push', (buses) => buses.forEach(bus => {
    try {
        if (bus.stops.passing.name.ja === '')
            console.log(bus);
    }
    catch (err) {
        console.log(bus);
    }
}));
//# sourceMappingURL=app.js.map