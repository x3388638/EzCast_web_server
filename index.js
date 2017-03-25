const CONFIG = require('./config.js');
const member = require('./member.js');
var mcast = require('./mcast.js');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var request = require('request');
var cors = require('cors');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
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
	
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

/**
 * API handler
 */
app.post('/message', cors(), function(req, res) {
	let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	ip = ip.replace('::ffff:', '');
	if(!member.isExist(ip) && ip != '127.0.0.1') {
		console.log(`===== receive msg from who is not member ${ip} =====`);
		res.send('access denied');
		return;
	}
	var msg = req.body.msg;
	console.log(`===== server get message from ${ip} =====`);
	console.log(msg);
	// send message to all members
	_castMsg(msg, ip);
	res.json({
		err: 0
	});
});

function _castMsg(msg, sender) {
	console.log(`===== cast meg to members =====`);
	let m = member.getMemberList();
	for(let receiver in m) {
		console.log(`===== POST to http://${receiver}:${+CONFIG.webPort-1}/message =====`);
		request.post({
			url: `http://${receiver}:${+CONFIG.webPort-1}/message`, 
			body: {
				msg, 
				ip: sender
			}, 
			json: true
		}, function(err, res, body) {
		});
	}
}

http.listen(CONFIG.webPort, function(){
	console.log('listening on 127.0.0.1:' + CONFIG.webPort);
});
