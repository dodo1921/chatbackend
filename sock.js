'use strict'

let sock;

let io = module.exports;

io.init = function(server){

	sock = require('socket.io')(server);

	return sock;

};

io.getInstance = function(){

	return sock;
	
}
