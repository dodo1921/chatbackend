'use strict'

var controllers = require('../controllers');
const knex = require('../utils/knex');
const memcached = require('../utils/memcache');
const structuredLogger = require('../utils/logger');
const io = require('./sock').getInstance();
const gcm = require('./utils/firebase');
const pubsub = require('@google-cloud/pubsub')();

const jewel = require('./utils/jewel');

var sockerioroutes = module.exports = {
  
  setup: function(socket, topic){

  	socket.on('publish', data =>{

      let j = jewel.generateForOneToOne();

      //insert in chat table

      io.of('/').in(data.channel).clients(function(error, clients){

          if(!error){

            if(clients.length>0)
              io.of('/').in(data.channel).emit('onetoone', data );

            else{

                memcached.get(data.channel, (err, user)=>{

                    if(!err){

                        if( user !== undefined && user.online){

                          //pubsub send
                          pubsub.publish(user.topic, data);


                        }else if(user !== undefined && !user.online){

                          gcm.emit(data);

                        }else if(user === undefined){

                                knex('users').where({
                                  id: data.channel
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

      



    });



    socket.on('delivery', data =>{

      
      io.of('/').in(data.channel).clients(function(error, clients){

          if(!error){

            if(clients.length>0)
              io.of('/').in(data.channel).emit('deliveryonetoone', data );

            else{

                memcached.get(data.channel, (err, user)=>{

                    if(!err){

                        if( user !== undefined && user.online){

                          //pubsub send
                          pubsub.publish(user.topic, data);


                        }else if(user !== undefined && !user.online){

                          gcm.emit(data);

                        }else if(user === undefined){

                                knex('users').where({
                                  id: data.channel
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

      



    });




    socket.on('read', data =>{

      
      io.of('/').in(data.channel).clients(function(error, clients){

          if(!error){

            if(clients.length>0)
              io.of('/').in(data.channel).emit('readonetoone', data );

            else{

                memcached.get(data.channel, (err, user)=>{

                    if(!err){

                        if( user !== undefined && user.online){

                          //pubsub send
                          pubsub.publish(user.topic, data);


                        }else if(user !== undefined && !user.online){

                          gcm.emit(data);

                        }else if(user === undefined){

                                knex('users').where({
                                  id: data.channel
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

    });

    socket.on('publish_group', data =>{});



    socket.on('delivery_group', data =>{

      
      io.of('/').in(data.channel).clients(function(error, clients){

          if(!error){

            if(clients.length>0)
              io.of('/').in(data.channel).emit('deliveryackgroup', data );

            else{

                memcached.get(data.channel, (err, user)=>{

                    if(!err){

                        if( user !== undefined && user.online){

                          //pubsub send
                          pubsub.publish(user.topic, data);


                        }else if(user !== undefined && !user.online){

                          gcm.emit(data);

                        }else if(user === undefined){

                                knex('users').where({
                                  id: data.channel
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

    });


    socket.on('read_group', data =>{

      
      io.of('/').in(data.channel).clients(function(error, clients){

          if(!error){

            if(clients.length>0)
              io.of('/').in(data.channel).emit('readackgroup', data );

            else{

                memcached.get(data.channel, (err, user)=>{

                    if(!err){

                        if( user !== undefined && user.online){

                          //pubsub send
                            pubsub.publish(user.topic, data);


                        }else if(user !== undefined && !user.online){

                            gcm.emit(data);

                        }else if(user === undefined){

                                knex('users').where({
                                  id: data.channel
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

    });

    socket.on('typing', data =>{

      
      io.of('/').in(data.channel).clients(function(error, clients){

          if(!error){

            if(clients.length>0)
                io.of('/').in(data.channel).emit('typingonetoone', data );

            else{

                memcached.get(data.channel, (err, user)=>{

                    if(!err){

                        if( user !== undefined && user.online){

                          //pubsub send
                          pubsub.publish(user.topic, data);


                        }

                    }

                });


            }


          }

      });

    }); 


    socket.on('typing_group', data =>{

      
      io.of('/').in(data.channel).clients(function(error, clients){

          if(!error){

            if(clients.length>0)
              io.of('/').in(data.channel).emit('typinggroup', data );

            else{

                memcached.get(data.channel, (err, user)=>{

                    if(!err){

                        if( user !== undefined && user.online){

                          //pubsub send
                          pubsub.publish(user.topic, data);


                        }

                    }

                });


            }


          }

      });

    });  


  	


  	socket.on('disconnect', () => {

      socket.request.headers.user.online = false;
      memcached.set( socket.request.headers.user.id , socket.request.headers.user, 600, function (err) {});  
  		console.log('Disconnected');
  		//socket.leave('omg');

  	});

  }
  
    	
};