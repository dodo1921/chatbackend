'use strict'

const knex = require('./knex');
const memcached = require('./memcache');
const structuredLogger = require('./logger');

var socketioutils = module.exports = {
  
  authenticate: function(socket, next){
  	
  	let str = socket.request.headers.cookie;

    if (typeof str !== 'string') {
	    next(new Error('Auth Error'));
	  }

	  if (str.substr(0, 2) !== 's:') {
	    next(new Error('Auth Error'));
	  }

	  var secret = ''; //process.env.secret
	  
    var val = signature.unsign(str.slice(2), secret)

    if (val !== false) {

    	memcached.get( val , (err, data) ==> {

    			if(err){
    								//Log error
    								structuredLogger.emit('error', 'Memcached Error'); 

				    				knex('users').where({
										  id: val
										}).select().then( users =>{

											if(users.length == 0 )
													next(new Error('Auth Error'));
											else if(!users[0].active)
													next(new Error('Auth Error'));
											else if(users[0].active){	
													socket.request.headers.user = users[0];
													memcached.set(val, users[0], 600, err ==> { /* log error */

															if(err)
																	structuredLogger.emit('error', 'Memcached Error'); 

													});
													next();							
											}		

										}).catch( err => {
												next(new Error('Auth Error'));
										});

    			}else if(data===undefined){

	    							knex('users').where({
										  id: val
										}).select().then( users =>{

											if(users.length == 0 )
													next(new Error('Auth Error'));
											else if(!users[0].active)
													next(new Error('Auth Error'));
											else if(users[0].active){	
													socket.request.headers.user = users[0];
													memcached.set(val, users[0], 600, err ==> { /* log error */});
													next();	
											}		

										});				


	    		}else{

					    			if(data.active){
					    				socket.request.headers.user = data;
					    				next();
					    			}
					    			else
					    				next(new Error('Auth Error'));

	    		}    			
        
      });

    }else
    	next(new Error('Auth Error'));
  	
  }


  
    	
};