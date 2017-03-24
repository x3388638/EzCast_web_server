const CONFIG = require('./config.js');
const member = require('./member.js');
var mcast = require('./mcast.js');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.use(express.static('web'));

var _socket;
io.on('connection', function(socket){
	_socket = socket
	var remoteIP = _socket.request.connection.remoteAddress.replace('::ffff:', '');
	console.log('a user connected, IP: ' + remoteIP);
	if(!member.isExist(remoteIP) && remoteIP != '127.0.0.1') {
		console.log(`Reject ws from ${remoteIP}.`);
		_socket.disconnect();
	}
	
	/**
	 * ws event receiver
	 */
	_socket.on('message', function(data) {
		var remoteIP = _socket.request.connection.remoteAddress.replace('::ffff:', '');
		data = JSON.parse(data);
		switch(data.event) {
			case 'newMessage': 
				_handleNewMessage(data.data.msg, remoteIP);
				break;
		}
	});

	_socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

function _handleNewMessage(msg, ip) {
	_socket.emit('message', JSON.stringify({
		event: 'newMessage', 
		data: {
			msg, 
			ip
		}
	}));
}

http.listen(CONFIG.webPort, function(){
	console.log('listening on 127.0.0.1:' + CONFIG.webPort);
});
