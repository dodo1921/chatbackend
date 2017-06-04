'use strict'

const config = require('./config');

const structuredLogger = require('fluent-logger').createFluentSender('myapp', {
  host: 'localhost',
  port: 24224,
  timeout: 3.0
});


module.exports = {

	logger: function(type, msg ){

		if(config.env === 'development'){
			console.log(type+'>>>>'+msg);
		}else{
			structuredLogger.emit(type, msg);
		}


	}

}