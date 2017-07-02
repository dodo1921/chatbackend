'use strict'


const knex = require('../utils/knex');
const memcached = require('../utils/memcache');
const structuredLogger = require('../utils/logger');
const io = require('../sock').getInstance();
const gcm = require('../utils/firebase');
const pubsub = require('@google-cloud/pubsub')();

const jewel = require('../utils/jewel');

const sendRT = require('../utils/sendRT');


var sockerioroutes = module.exports = {
  
  setup: function(socket){

  	socket.on('publish', data =>{

        let j = jewel.generateForOneToOne();

        data.jeweltype_id = j;
        data.created_at = new Date().getTime();
        // insert in chat table

        knex.returning('id').table('chats').insert(data)
        .then( id => {
          data.id = id[0];
          sendRT.sendRTmsg(data);
          socket.emit('publish_ack', { error: false, msg_id: data.sender_msgid, serverid: id[0], created_at: data.created_at } );
        })
        .catch( err =>{
          socket.emit('publish_ack', {error: true, message : err.message } );
        });     


    });



    socket.on('delivery', data =>{

          data.created_at = new Date().getTime();
          // insert in chat table

          knex.returning('id').table('chats').insert(data)
          .then( id => {
            sendRT.sendRTmsg(data);
            socket.emit('delivery_ack', { error: false, serverid: id[0] , delivered: data.created_at } );
          })
          .catch( err =>{
            socket.emit('delivery_ack', { error: true } );
          });         


    });


    socket.on('read', data =>{


          data.created_at = new Date().getTime();
          // insert in chat table

          knex.returning('id').table('chats').insert(data)
          .then( id => {
            sendRT.sendRTmsg(data);
            socket.emit('read_ack', { error: false, serverid: id[0] , read: data.created_at } );
          })
          .catch( err =>{
            socket.emit('read_ack', { error: true } );
          });            

    });

    socket.on('publish_group', data =>{

          let j = jewel.generateForOneToOne();

          data.jeweltype_id = j;
          data.created_at = new Date().getTime();
          // insert in chat table

          knex.returning('id').table('groupchats').insert(data)
          .then( id => {
            sendRT.sendRTGroupmsg(data, socket.request.headers.user.id);
            socket.emit('publish_group_ack', {error: false, msg_id: data.sender_msgid, serverid: id[0], created_at: data.created_at} );
          })
          .catch( err =>{
            socket.emit('publish_group_ack', {error: true} );
          });
          

    });


    socket.on('publish_group_active', data =>{


          let j = jewel.generateForGroup();

          data.jeweltype_id = j;
          data.created_at = new Date().getTime();
          // insert in chat table

          knex.returning('id').table('groupchats').insert(data)
          .then( id => {
            sendRT.sendRTGroupmsg(data, socket.request.headers.user.id);
            socket.emit('publish_group_ack', {error: false, msg_id: data.sender_msgid, serverid: id[0], created_at: data.created_at} );
          })
          .catch( err =>{
            socket.emit('publish_group_ack', {error: true} );
          });   

      
    });


    socket.on('check_online', id=>{     

        memcached.get( id , (err, data) => {

          if(!err && data !== undefined){

             socket.emit('checkonline_ack', { id , online: data.online } ); 

          }

        });

    });


    socket.on('typing', data =>{     
        
        sendRT.sendTyping(data);


    });    


  	


  	socket.on('disconnect', () => {

      socket.request.headers.user.online = false;
      let rt = {};
      rt.online = false;
      memcached.set( socket.request.headers.user.id , rt , 600, function (err) {});  

      knex('user').where({id: socket.request.headers.user.id }).update({online:false}).then(()=>{}).catch(err=>{});
  		console.log('Disconnected');
  		//socket.leave('omg');

  	});

  }
  
    	
};