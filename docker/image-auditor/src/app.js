const protocol = require("./protocol.js");
const dgram = require('dgram');
const net = require('net');

// Auditor TCP port
const TCP_PORT = 2205;
// wait 5 seconds before connecting to TCP
const INTERVAL = 5000;

const instruments = new Map(Array.from(protocol.INSTRUMENTS, e => [e[1], e[0]]));

const socketUDP = dgram.createSocket('udp4');
const server = net.createServer();

// Creating new map for musicians
var musicians = new Map();

function getSound(message) {
    var msg = JSON.parse(message);
    var musician = musicians.get(msg.uuid);
    var now = Date.now();

    // If musician is active
    if (!(musician != undefined && now - musician.last <= INTERVAL)) {
        musicians.set(msg.uuid, {instrument:instruments.get(msg.sound), first:now, last:now});
    }else {
        musicians.set(msg.uuid, {instrument:musician.instrument, first:musician.first, last:now});
    }
}

function connect(socket) {
    var now = Date.now();
    var msg = JSON.stringify([...musicians].filter(([key, value]) => {
        // If a musician is inactive, remove him
        if (now - value.last > INTERVAL) {
            console.log("Remove inactive musician: ", key);
            musicians.delete(key);
            return false;
        }
        return true;
    }).map(([key, value]) => {
        return {uuid: key, instrument: value.instrument, activeSince: new Date(value.first)};
    }));

    socket.write(msg);
    socket.write("\n");
    socket.end();
}
socketUDP.on("message", getSound);

// MultiCast
socketUDP.bind(protocol.PORT, function() {
    console.log("Join multicast");
    socketUDP.addMembership(protocol.HOSTNAME);
});
server.listen(TCP_PORT);

server.on("connection", connect);