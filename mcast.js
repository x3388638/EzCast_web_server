const CONFIG = require('./config.js');
const member = require('./member.js');
var dgram = require('dgram');
var serverSocket = dgram.createSocket("udp4");
var SRC_PORT = CONFIG.udpPort;
var DES_PORT = +SRC_PORT-1;
var MULTICAST_ADDR = CONFIG.multicastAddr;

serverSocket.bind(SRC_PORT, function () {
	console.log(`udp built on port ${SRC_PORT}`);
	serverSocket.addMembership(MULTICAST_ADDR);
});

serverSocket.on('listening', function () {
	var address = serverSocket.address();
	console.log('udp listening on ' + address.address + ":" + address.port);
});

/**
 * ws event receiver
 */
serverSocket.on('message', function (message, rinfo) {
	var remoteAddr = rinfo.address;
	var msg = JSON.parse(message);
	switch(msg.event) {
		case 'register':
			_handleRegister(msg.data.key, remoteAddr);
			break;
	}
});

function _handleRegister(key, ip) {
	member.addMember(ip);
	var msg = JSON.stringify({
		event: 'register', 
		data: {
			key, 
			ip
		}
	});
	serverSocket.send(new Buffer(msg), DES_PORT, MULTICAST_ADDR, function() {
		console.log(`Send multicast to port ${DES_PORT} ::: ${msg}`);
	});
}

module.exports = {
};
