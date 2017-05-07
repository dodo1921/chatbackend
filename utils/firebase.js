'use strict'

const request = require('request');

let gcm = module.exports;

gcm.emit = function(message, to){

		let msg = {};
	  msg.to = message.gcmtoken;
	  msg.data = message;

		request({
		    headers: {	      
		      'Content-Type': 'application/json',
		      'Authorization': 'key=' + process.env.gcmkey
		    },
		    uri: 'https://fcm.googleapis.com/fcm/send',
		    body: message,
		    method: 'POST'
		  }, function (err, res, body) {
		    //it works!
		  });

}