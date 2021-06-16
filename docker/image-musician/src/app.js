const protocol = require("./protocol.js");
// UDP/datagram sockets
const dgram = require("dgram");
const INTERVAL = 1000;

// https://www.npmjs.com/package/rfc4122
const RFC4122 = require('rfc4122');
// Faster version of V4 //
const uuid = new RFC4122().v4f();

const socket = dgram.createSocket('udp4');
const sounds = new Map(protocol.INSTRUMENTS);

// Check if instrument is here
if (process.argv.length < 3) {
    console.error("Not enough args.");
    process.exit();
}

const sound = sounds.get(process.argv[2]);

if (sound == undefined) {
    console.error("Invalid instrument");
    process.exit();
}

setInterval(() => socket.send(JSON.stringify({uuid:uuid, sound:sound}), protocol.PORT, protocol.HOSTNAME), INTERVAL);
