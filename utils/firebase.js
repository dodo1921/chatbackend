'use strict'

const request = require('request');
const config = require('./config');

const log = require('./logger');

let gcm = module.exports;

gcm.emit = function(message, to){

		let msg = {};
	  msg.to = to;
	  msg.data = message;
	  if(message.eventname === 'new_msg' || message.eventname === 'new_group_msg'){
		  	
		  	msg.notification = {};
		  	if( message.type === 1 ){
		  		msg.notification.body = message.name+':'+message.msg;
		  	}else if( message.type === 2 ){
		  		msg.notification.body = message.name+': Sent a new photo';
		  	}else if( message.type === 3 ){
		  		msg.notification.body = message.name+': Sent a new video';
		  	}else if( message.type === 4 ){
		  		msg.notification.body = message.name+': Sent a new photo';
		  	}

	  }
	  
	  console.log(JSON.stringify(msg));

		request({
		    headers: {	      
		      'Content-Type': 'application/json',
		      'Authorization': 'key=' + config.gcmkey
		    },
		    uri: 'https://fcm.googleapis.com/fcm/send',
		    body: JSON.stringify(msg),
		    method: 'POST'
		  }, function (err, res, body) {

		  		if(err)
		  			log.logger('error', err );
		  		else
		  			log.logger('success', body);
		     
		  });

}