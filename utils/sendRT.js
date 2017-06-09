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


let helperfunc_group = function(group, data, user_id){

	for(let i=0; i<group.length; i++){

		if(group[i].sender_id !== user_id){

				if(group[i].online){

						if(group[i].topic === config.topicname)
								io.of('/').in(group[i].id).emit( data.eventname, data );
						else{
								data.receiver_id = group[i].id;
								pubsub.publish(group[i].topic, data);
						}		
				}else{
					gcm.emit(data, group[i].token_google);
				}


		}

	} 


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

	},

	sendRTGroupmsg: function(data, user_id){


						knex('groupmembers').where({ group_id: data.group_id}).join('users', 'users.id', '=', 'groupmembers.user_id')
				  	.select('users.id as id', 'users.topic as topic', 'users.online as online', 'users.token_google as token_google' )
						.then((group)=>{
							//memcached.set( 'gr_'+data.group_id , group , 600, function (err) {});  
							helperfunc_group(group, data, user_id);
						})

						

	}


}