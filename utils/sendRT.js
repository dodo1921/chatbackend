'use strict'


const knex = require('../utils/knex');
const memcached = require('../utils/memcache');
const log = require('../utils/logger');
const io = require('../sock').getInstance();
const gcm = require('../utils/firebase');
const config = require('../utils/config');

//const pubsub = require('@google-cloud/pubsub')();

const pub  = require('../utils/inter_process');
const topic = require('../utils/topic_initialize')



let helperfunc = function(data){

	memcached.get(data.receiver_id, (err, user)=>{

			if(err || user === undefined){
					//console.log('>>>>>memcached '+data.receiver_id);	
					knex('users').where({ id: data.receiver_id}).select()
	        .then( users =>{
	        	console.log('>>>>>memcached'+JSON.stringify(users));	
	          if(users.length>0){
	          	console.log('memcached'+JSON.stringify(users[0]));	
	            if(users[0].online && users[0].topic !== config.topicname && config.env === 'production')
	            	pub.emit(users[0].topic, data);
	              //pubsub.publish(user[0].topic, data);
	            else{  
	            	console.log('memcached');
	              gcm.emit( data, users[0].token_google);                         
	            }
	              
	          }
	          
	        })
	        .catch( err => {
	        	console.log('>>>>>memcached '+err);	
	        });

			}else{

					if(user.online && user.topic !== topic.name && config.env === 'production')
	          pub.emit(user.topic, data);
	              //pubsub.publish(user.topic, data);
	        else{  
	        	console.log('database>>>>'+JSON.stringify(user));
	          gcm.emit( data, user.token_google); 
	        }  
			}

	});            


}


let helperfuncTyping = function(data){

	memcached.get(data.receiver_id, (err, user)=>{

			if(err || user === undefined){
					

			}else{

					if(user.online && user.topic !== topic.name && config.env === 'production')
	          	pub.emit(user[0].topic, data);
	              //pubsub.publish(user.topic, data);
	         

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
								pub.emit(group[i].topic, data);
	              //pubsub.publish(group[i].topic, data);
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

						

	},

	sendTyping: function(data){

						io.of('/').in(data.receiver_id).clients( (error, clients)=>{

			          	if(error){			          		
			          		return;
			          	}

			            if(clients.length>0)
			              io.of('/').in(data.receiver_id).emit( data.eventname, data );
			            else
			            	helperfuncTyping(data)
			          
			      });		

	}


}