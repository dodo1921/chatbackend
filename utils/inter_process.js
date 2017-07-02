'use strict'

const request = require('request');
const config = require('./config');

const log = require('./logger');

let pub = module.exports;

pub.emit = function(server_uri, msg ){
		
		request({

		    uri: server_uri,
		    body: msg,
		    method: 'POST'
		  }, function (err, res, body) {

		  		if(err)
		  			log.logger('error', err );
		  		else
		  			log.logger('success', body);
		     
		  });

}