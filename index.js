const CONFIG = require('./config.js');
const member = require('./member.js');
var mcast = require('./mcast.js');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.use(express.static('web'));

io.on('connection', function(socket){
	let connectedIP = socket.request.connection.remoteAddress.replace('::ffff:', '');
	console.log(`===== A ws client connected, IP: ${connectedIP} =====`);
	if(!member.isExist(connectedIP) && connectedIP != '127.0.0.1') {
		console.log(`Reject ws from ${connectedIP}.`);
		socket.disconnect();
	}
	
	/**
	 * ws event receiver
	 */
	socket.on('message', function(data) {
		let remoteIP = socket.request.connection.remoteAddress.replace('::ffff:', '');
		console.log(`===== Server get message from ${remoteIP} via ws =====`);
		console.log(data);
		data = JSON.parse(data);
		switch(data.event) {
			case 'newMessage': 
				socket.emit('message', JSON.stringify({
					event: 'newMessage', 
					data: {
						msg: data.data.msg, 
						ip: remoteIP
					}
				}));
				break;
		}
	});

	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

http.listen(CONFIG.webPort, function(){
	console.log('listening on 127.0.0.1:' + CONFIG.webPort);
});
