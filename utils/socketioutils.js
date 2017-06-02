'use strict'

const knex = require('./knex');
const memcached = require('./memcache');
const structuredLogger = require('./logger');
const signature = require('cookie-signature');
const cp = require('cookie-parser');

var socketioutils = module.exports = {
  
  authenticate: function(socket, next){
  	
  	

  	let cookieParser = cp(secret);
	  let req = {
	    headers:{
	      cookie: socket.request.headers.cookie
	    }
	  };
	  let result;
	  cookieParser(req, {}, function (err) {
	    if (err) throw err;
	    result = req.signedCookies || req.cookies;
	  });

  	let sessionId = result['connect.sid'];

    if (sessionId !== false) {

    	memcached.get( sessionId , (err, data) => {

    			if(err || data===undefined){
    								//Log error
    								if(err)
    									structuredLogger.emit('error', 'Memcached Error'); 

				    				knex('users').where({sessionId})
				    				.select()
				    				.then( users =>{

											if(users.length == 0 )
													next(new Error('Auth Error'));
											else if(!users[0].active)
													next(new Error('Auth Error'));
											else if(users[0].active){	
													socket.request.headers.user = users[0];


													memcached.set( sessionId, users[0], 600, err => { /* log error */

															if(err)
																	structuredLogger.emit('error', 'Memcached Error'); 

													});
													next();							
											}		

										}).catch( err => {
												next(new Error('Auth Error'));
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