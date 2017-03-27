const CONFIG = require('./config.js');
const member = require('./member.js');
var os = require('os');
var dgram = require('dgram');
var serverSocket = dgram.createSocket("udp4");
var SRC_PORT = CONFIG.udpPort;
var DES_PORT = +SRC_PORT-1;
var MULTICAST_ADDR = CONFIG.multicastAddr;
var LOCAL_INTERFACES = [];

/**
 * get local interfaces ip
 */
var interfaces = os.networkInterfaces();
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            LOCAL_INTERFACES.push(address.address);
        }
    }
}

serverSocket.bind(SRC_PORT);

serverSocket.on('listening', function () {
	console.log(`udp built on port ${SRC_PORT}`);
	for(let ip of LOCAL_INTERFACES) {
		serverSocket.addMembership(MULTICAST_ADDR, ip);
	}

	var address = serverSocket.address();
	console.log('udp listening on ' + address.address + ":" + address.port);
});

/**
 * multicast event receiver
 */
serverSocket.on('message', function (message, rinfo) {
	// console.log(message);
	var remoteAddr = rinfo.address;
	try {
		var msg = JSON.parse(message);
	} catch(err) {
		console.log(err);
	}
	if(!msg) {
		return;
	}
	switch(msg.event) {
		case 'register':
			_handleRegister(msg.data.name || remoteAddr, msg.data.key, remoteAddr);
			break;
	}
});

function _handleRegister(name, key, ip) {
	member.addMember(name, ip);
	console.log(`===== new member added: ${ip} =====`);
	console.log(JSON.stringify(member.getMemberList()));
	var msg = JSON.stringify({
		event: 'register', 
		data: {
			key, 
			ip, 
			name
		}
	});
	serverSocket.send(new Buffer(msg), DES_PORT, MULTICAST_ADDR, function() {
		console.log(`Send multicast to port ${DES_PORT} ::: ${msg}`);
	});
}

module.exports = {
};
