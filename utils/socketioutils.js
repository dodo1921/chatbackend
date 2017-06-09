'use strict'

const knex = require('./knex');
const memcached = require('./memcache');
const log = require('./logger');
const signature = require('cookie-signature');
const cp = require('cookie-parser');
const config = require('./config');

var socketioutils = module.exports = {
  
  authenticate: function(socket, next){
  	
  	let cookieParser = cp(config.secret);
	  let req = {
	    headers:{
	      cookie: socket.request.headers.cookie
	      //cookie: 'connect.sid=s%3A0UoJPYl7Q7qKOW5cSP_LwSp1BwVECJm3.HzsrewEw%2FDqcUy6fFveAdOI%2Bs2eOmUaBZTdKQ3TK66w;'
	    }
	  };

	  let result;

	  cookieParser(req, {}, function (err) {
	    if (err) throw err;
	    result = req.signedCookies || req.cookies ;
	  });

	  console.log(result);

	  if(!result['connect.sid']){
	  	console.log('omg')
	  	next(new Error('Auth Error')); 
	  	//socket.disconnect();
	  	return;
	  }

  	let sessionId = result['connect.sid'];

  	console.log(sessionId);


    if (result !== false) {

    	let parts = sessionId.split('::::');
    	if(parts.length != 2){
    		next(new Error('Auth Error'));
    		//socket.disconnect();
    	}
    	else{
			    	memcached.get( parts[0] , (err, data) => {

			    			if(err || data===undefined){
			    								//Log error
			    								if(err)
			    									log.logger('error','Memcached Error...');

							    				knex('users').where({id: part[0], scode: parts[1], active:true })
							    				.select()
							    				.then( users =>{

														if(users.length == 0 ){
																next(new Error('Auth Error'));
																//socket.disconnect();
														}else if(!users[0].active){
																next(new Error('Auth Error'));
																//socket.disconnect();
														}else if(users[0].active){	
																socket.request.headers.user = users[0];
																memcached.set( user[0].id, users[0], 600, err => { /* log error */

																		if(err)
																				log.logger('error','Memcached Error...'); 

																});
																next();							
														}		

													}).catch( err => {
															next(new Error('Auth Error'));
															//socket.disconnect();
													});

			    			}else{
			    				
								    			if(data.active){
								    				socket.request.headers.user = data;
								    				next();
								    			}
								    			else{
								    				next(new Error('Auth Error'));
								    				//socket.disconnect();
								    			}

				    		}    			
			        
			      });
					}

    }else{
    	next(new Error('Auth Error'));
    	//socket.disconnect();
    }
  	
  }


  
    	
};