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
var Entities = require('html-entities').AllHtmlEntities;
var htmlEntity = new Entities();
var moment = require('moment');

let _msgStorage = [];
let _msgLimit = 50;

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
	var msg = htmlEntity.encode(req.body.msg);
	console.log(`===== server get message from ${ip} =====`);
	console.log(msg);
	var name = member.getMember(ip).name;
	var time = moment().format('HH:mm');
	// send message to all members
	_storeMsg(msg, ip, name, time);
	_castMsg(msg, ip, name, time);
	res.json({
		err: 0
	});
});

app.get('/message', cors(), function(req, res) {
	let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	ip = ip.replace('::ffff:', '');
	if(!member.isExist(ip) && ip != '127.0.0.1') {
		console.log(`===== receive msg from who is not member ${ip} =====`);
		res.send('access denied');
		return;
	}
	res.json({
		err: 0, 
		list: _msgStorage
	});
});

app.post('/disconnect', cors(), function(req, res) {
	let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	ip = ip.replace('::ffff:', '');
	let memberList = member.deleteMember(ip);
	console.log(`===== member deleted ${ip} =====`);
	console.log(`member list: ${JSON.stringify(memberList)}`);
});

app.post('/user', cors(), function(req, res) {
	let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	ip = ip.replace('::ffff:', '');
	let name = req.body.name;
	member.updateMember(ip, {name});
	console.log(`===== member name updated ${ip} ${name} =====`);
	res.json({
		err: 0
	});
});

function _castMsg(msg, sender, name, time) {
	console.log(`===== cast meg to members =====`);
	let m = member.getMemberList();
	for(let receiver in m) {
		console.log(`===== POST to http://${receiver}:${+CONFIG.webPort-1}/message =====`);
		request.post({
			url: `http://${receiver}:${+CONFIG.webPort-1}/message`, 
			body: {
				msg, 
				name, 
				time, 
				ip: sender
			}, 
			json: true
		}, function(err, res, body) {
		});
	}
}

function _storeMsg(msg, ip, name, time) {
	_msgStorage = [..._msgStorage, {
		msg, 
		ip, 
		name, 
		time
	}];
	if(_msgStorage.length > _msgLimit) {
		_msgStorage = _msgStorage.slice(1);
	}
}

http.listen(CONFIG.webPort, function(){
	console.log('listening on 127.0.0.1:' + CONFIG.webPort);
});
