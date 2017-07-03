'use strict'

const request = require('request');
const config = require('./config');

const log = require('./logger');

let topic = module.exports;

topic.name = '';

topic.initialize = function(){

	if(config.env === 'development'){
			console.log('Body>>>');
			request({
					headers: {	      
		      	'X-Google-Metadata-Request': true		      	
		    	},
			    uri: 'http://metadata/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip',			    
			    method: 'GET'
			  }, function (err, res, body) {

			  		if(err)
			  			log.logger('error', 'topic initialize error:' + err );
			  		else{
			  			console.log('Body>>>'+body);
			  			topic.name = body;
			  		}
			     
			  });

	}else{

		topic.name = 'localhost:3000';
	}		

};





