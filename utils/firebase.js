'use strict'

const request = require('request');
const config = require('./config');

const log = require('./logger');

let gcm = module.exports;

gcm.emit = function(message, to){

		let msg = {};
	  msg.to = to;
	  msg.data = message;

		request({
		    headers: {	      
		      'Content-Type': 'application/json',
		      'Authorization': 'key=' + config.gcmkey
		    },
		    uri: 'https://fcm.googleapis.com/fcm/send',
		    body: msg,
		    method: 'POST'
		  }, function (err, res, body) {

		  		if(err)
		  			log.logger('error', err );
		  		else
		  			log.logger('success', body);
		     
		  });

}