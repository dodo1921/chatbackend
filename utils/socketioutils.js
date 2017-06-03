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

  	let parts = sessionId.split('::::');

    if (sessionId !== false) {

    	let parts = sessionId.split('::::');
    	if(parts.length != 2)
    		next(new Error('Auth Error'));
    	else{
			    	memcached.get( parts[0] , (err, data) => {

			    			if(err || data===undefined){
			    								//Log error
			    								if(err)
			    									structuredLogger.emit('error', 'Memcached Error'); 

							    				knex('users').where({id: part[0], scode: parts[1], active:true })
							    				.select()
							    				.then( users =>{

														if(users.length == 0 )
																next(new Error('Auth Error'));
														else if(!users[0].active)
																next(new Error('Auth Error'));
														else if(users[0].active){	
																socket.request.headers.user = users[0];


																memcached.set( user[0].id, users[0], 600, err => { /* log error */

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
					}

    }else
    	next(new Error('Auth Error'));
  	
  }


  
    	
};