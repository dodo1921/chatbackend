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

        if(!socket.request.headers.user.jewel_block || !socket.request.headers.user.is_rooted){

          let j = jewel.generateForOneToOne();
          data.jeweltype_id = j;
        }

        data.created_at = new Date().getTime();
        // insert in chat table

        knex.returning('id').table('chats').insert(data)
        .then( id => {
          data.id = id[0];
          sendRT.sendRTmsg(data);
          socket.emit('publish_ack', { error: false, eventname: 'publish_ack', sender_msgid: data.sender_msgid, chat_id: id[0], created_at: data.created_at } );

          /*
          let packet = {};
          packet.chat_id = id[0];
          packet.sender_id = data.sender_id;
          packet.sender_msgid = data.sender_msgid;
          packet.receiver_id = data.sender_id;
          packet.eventname = 'publish_ack';
          packet.created_at = data.created_at;

          knex.returning('id').table('chats').insert(packet)
          .then(id => {})
          .catch(err => {});  
          */

        })
        .catch( err =>{
          socket.emit('publish_ack', {error: true, message : err.message, sender_msgid: data.sender_msgid } );
        });     


    });



    socket.on('delivery', data =>{

          data.created_at = new Date().getTime();
          // insert in chat table

          knex.returning('id').table('chats').insert(data)
          .then( id => {
            sendRT.sendRTmsg(data);
            socket.emit('delivery_ack', { error: false, eventname: 'delivery_ack', sender_msgid: data.sender_msgid,  delivered: data.created_at } );
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
            socket.emit('read_ack', { error: false, eventname: 'read_ack', sender_msgid: data.sender_msgid, read: data.created_at } );
          })
          .catch( err =>{
            socket.emit('read_ack', { error: true } );
          });            

    });

    socket.on('publish_group', data =>{

          if(!socket.request.headers.user.jewel_block || !socket.request.headers.user.is_rooted){

            let j = jewel.generateForOneToOne();
            data.jeweltype_id = j;
          }

          data.created_at = new Date().getTime();
          // insert in chat table

          knex.returning('id').table('groupchats').insert(data)
          .then( id => {
            sendRT.sendRTGroupmsg(data, socket.request.headers.user.id);
            socket.emit('publish_group_ack', {error: false, eventname: 'publish_group_ack', sender_msgid: data.sender_msgid, chat_id: id[0], created_at: data.created_at} );

            let packet = {};
            packet.chat_id = id[0];
            packet.sender_id = data.sender_id;
            packet.sender_msgid = data.sender_msgid;
            packet.eventname = 'publish_group_ack';
            packet.created_at = data.created_at;

            knex.returning('id').table('groupchats').insert(packet)
            .then(id => {})
            .catch(err => {}); 


          })
          .catch( err =>{
            socket.emit('publish_group_ack', {error: true} );
          });
          

    });


    socket.on('publish_group_active', data =>{

          if(!socket.request.headers.user.jewel_block || !socket.request.headers.user.is_rooted){
            let j = jewel.generateForGroup();
            data.jeweltype_id = j;
          }
            
          data.created_at = new Date().getTime();
          // insert in chat table

          knex.returning('id').table('groupchats').insert(data)
          .then( id => {
            sendRT.sendRTGroupmsg(data, socket.request.headers.user.id);
            socket.emit('publish_group_ack', {error: false, eventname: 'publish_group_ack', sender_msgid: data.sender_msgid, chat_id: id[0], created_at: data.created_at} );

            let packet = {};
            packet.chat_id = id[0];
            packet.sender_id = data.sender_id;
            packet.sender_msgid = data.sender_msgid;
            packet.eventname = 'publish_group_ack';
            packet.created_at = data.created_at;

            knex.returning('id').table('groupchats').insert(packet)
            .then(id => {})
            .catch(err => {}); 

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
      memcached.set( socket.request.headers.user.id , socket.request.headers.user , 600, function (err) {});  

      knex('users').where({id: socket.request.headers.user.id }).update({online:false}).then(()=>{}).catch(err=>{});
  		console.log('Disconnected');
  		//socket.leave('omg');

  	});

  }
  
    	
};