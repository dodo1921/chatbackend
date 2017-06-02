'use strict'

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes');


const app = express();
const server = require('http').Server(app);
//const io = require('socket.io')(server);

const io = require('./sock').init(server);
//io.set('transports', ['websocket']);

const socketioutils = require('./utils/socketioutils');
const socketioroutes = require('./socketioroutes');


const pubsub = require('@google-cloud/pubsub')();

const gcm = require('./utils/firebase');

//const knex = require('./util/knex');

const structuredLogger = require('./utils/logger');

const memcached = require('./utils/memcache');

memcached.set('foo', 'bar', 10000, function (err) { 
      
      console.log('Memcached....') 

      memcached.get('foo', function (err, data) {
        console.log('Memcached:'+data);
      });

});



let topicname = 'projects/testjewelchat/topics/topic1';
let subc_name = 'subscription1';


pubsub.subscribe( topicname, subc_name ,{
  ackDeadlineSeconds: 90,
  autoAck: true,
  interval: 30
}).then( data => {

  const subscription = data[0];

  console.log('Subscription name:' + subscription.name);
  structuredLogger.emit('error', 'Subscription name:'+ subscription.name); 

  function onError(err) {

    console.log('Error subscription');
    structuredLogger.emit('error', 'Subscription Error:'+ err);  

  }

  function onMessage(message) {

      //var clientNumber = io.sockets.adapter.rooms[room].length;

      io.of('/').in(message.channel).clients(function(error, clients){
          
          //if (error) throw error;
          
          if(clients.length>0){

              io.to(message.channel).emit( message.eventname , message );

          }else{

              //rewrite memcache and turn the client offline
              memcache.get(message.channel, (err, data) => {

                  if(!err){

                    data.online = false;
                    memcache.set(message.channel, data, (err, data) => {  });

                  }

              });
              //send via gcm
              
              gcm.emit(message);

          }

      });     

  }

  subscription.on('error', onError);
  subscription.on('message', onMessage);


}).catch( err => {
    console.log('Error pubsub'+ err );
    structuredLogger.emit('error', 'Subscription Error:'+ err);  
});



io.use(socketioutils.authenticate);

io.on('connection', function(socket){
  
  structuredLogger.emit('info', 'Connection '+ socket.request.headers.user.id);

  socket.request.headers.user.online = true;
  socket.request.headers.user.topic = topicname;

  memcached.set( socket.request.headers.user.id , socket.request.headers.user, 600, function (err) { });  
  socket.join(socket.request.headers.user.id);
  socket.emit('join', { pid: process.pid});

	socketioroutes.setup(socket, topicname );  

});



app.use(function(req, res, next){
  res.io = io;
  next();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  
  res.status(err.status || 500);
  res.json({error: true, message: err.message });
});

module.exports = {app: app, server: server};
