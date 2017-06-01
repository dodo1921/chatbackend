'use strict'

var controllers = require('../controllers');
const knex = require('../utils/knex');
const memcached = require('../utils/memcache');
const structuredLogger = require('../utils/logger');
const io = require('./sock').getInstance();
const gcm = require('./utils/firebase');
const pubsub = require('@google-cloud/pubsub')();

const jewel = require('./utils/jewel');


function sendRTmsg(data){

      io.of('/').in(data.receiver_id).clients(function(error, clients){

          if(!error){

            if(clients.length>0)
              io.of('/').in(data.receiver_id).emit( data.eventname, data );
            else{
                memcached.get(data.receiver_id, (err, user)=>{

                    if(!err){
                        if( user !== undefined && user.online){
                          //pubsub send
                          pubsub.publish(user.topic, data);
                        }else if(user !== undefined && !user.online){
                          gcm.emit(data, user.token_google);
                        }else if(user === undefined){
                                knex('users').where({
                                  id: data.receiver_id
                                }).select().then( users =>{
                                  if(users[0])
                                    gcm.emit( data, users[0].token_google);
                                }).catch( err => {
                                    
                                });
                        }
                    }
                });
            }
          }
      });

}

var sockerioroutes = module.exports = {
  
  setup: function(socket, topic){

  	socket.on('publish', data =>{

          let j = jewel.generateForOneToOne();

          data.jeweltype_id = j;
          data.created_at = new Date().getTime();
          // insert in chat table

          knex.returning('id').table('chats').insert(data)
          .then( id => {
            socket.emit('publish_ack', {error: false} );
          })
          .catch( err =>{
            socket.emit('publish_ack', {error: true} );
          });

          sendRTmsg(data);


    });



    socket.on('delivery', data =>{

          data.created_at = new Date().getTime();
          // insert in chat table

          knex.returning('id').table('chats').insert(data)
          .then( id => {
            socket.emit('delivery_ack', {error: false} );
          })
          .catch( err =>{
            socket.emit('delivery_ack', {error: true} );
          });

          sendRTmsg(data);


    });




    socket.on('read', data =>{


          data.created_at = new Date().getTime();
          // insert in chat table

          knex.returning('id').table('chats').insert(data)
          .then( id => {
            socket.emit('read_ack', {error: false} );
          })
          .catch( err =>{
            socket.emit('read_ack', {error: true} );
          });

          
          sendRTmsg(data);    

    });

    socket.on('publish_group', data =>{

          let j = jewel.generateForOneToOne();

          data.jeweltype_id = j;
          data.created_at = new Date().getTime();
          // insert in chat table

          knex.returning('id').table('groupchats').insert(data)
          .then( id => {
            socket.emit('publish_group_ack', {error: false} );
          })
          .catch( err =>{
            socket.emit('publish_group_ack', {error: true} );
          });

          sendRTmsg(data);    

    });


    socket.on('publish_group_active', data =>{


          let j = jewel.generateForGroup();

          data.jeweltype_id = j;
          data.created_at = new Date().getTime();
          // insert in chat table

          knex.returning('id').table('groupchats').insert(data)
          .then( id => {
            socket.emit('publish_group_active_ack', {error: false} );
          })
          .catch( err =>{
            socket.emit('publish_group_active_ack', {error: true} );
          });

          sendRTmsg(data);    

      
    });



    socket.on('delivery_group', data =>{

          data.created_at = new Date().getTime();
          // insert in chat table

          knex.returning('id').table('chats').insert(data)
          .then( id => {
            socket.emit('delivery_group_ack', {error: false} );
          })
          .catch( err =>{
            socket.emit('delivery_group_ack', {error: true} );
          });

          
          sendRTmsg(data);         
      

    });


    socket.on('read_group', data =>{

          data.created_at = new Date().getTime();
          // insert in chat table

          knex.returning('id').table('chats').insert(data)
          .then( id => {
            socket.emit('read_group_ack', {error: false} );
          })
          .catch( err =>{
            socket.emit('read_group_ack', {error: true} );
          });
          
          sendRTmsg(data);    

    });

    socket.on('typing', data =>{     
      

    }); 


    socket.on('typing_group', data =>{      
      

    });  


  	


  	socket.on('disconnect', () => {

      socket.request.headers.user.online = false;
      memcached.set( socket.request.headers.user.id , socket.request.headers.user, 600, function (err) {});  
  		console.log('Disconnected');
  		//socket.leave('omg');

  	});

  }
  
    	
};