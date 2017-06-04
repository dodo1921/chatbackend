'use strict'


const knex = require('../utils/knex');
const memcached = require('../utils/memcache');
const log = require('../utils/logger');
const io = require('../sock').getInstance();
const gcm = require('../utils/firebase');
const config = require('../utils/config');

const pubsub = require('@google-cloud/pubsub')();



let helperfunc = function(data){

	memcached.get(data.receiver_id, (err, user)=>{

			if(err || user === undefined){

					knex('users').where({
	          id: data.receiver_id
	        }).select()
	        .then( users =>{

	          if(users[0]){

	            if(user[0].online && user[0].topic !== config.topicname && config.env === 'production')
	              pubsub.publish(user[0].topic, data);
	            else  
	              gcm.emit( data, users[0].token_google);                         

	          }
	          
	        })
	        .catch( err => {});

			}else{

					if(user.online && user.topic !== config.topicname && config.env === 'production')
	          pubsub.publish(user.topic, data);
	        else  
	          gcm.emit( data, users.token_google); 

			}

	});            


}


module.exports = {


	sendRTmsg: function(data){

			      io.of('/').in(data.receiver_id).clients( (error, clients)=>{

			          	if(error){
			          		helperfunc(data);
			          		return;
			          	}

			            if(clients.length>0)
			              io.of('/').in(data.receiver_id).emit( data.eventname, data );
			            else
			            	helperfunc(data)
			          
			      });

	}


}