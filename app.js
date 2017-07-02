'use strict'

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes');
const config = require('./utils/config');

const app = express();
const server = require('http').Server(app);
//const io = require('socket.io')(server);

const io = require('./sock').init(server);
//io.set('transports', ['websocket']);

const socketioutils = require('./utils/socketioutils');
const sendRT = require('./utils/sendRT');
const socketioroutes = require('./socketioroutes');



const gcm = require('./utils/firebase');

//const knex = require('./util/knex');

const log = require('./utils/logger');

const memcached = require('./utils/memcache');

const topic = require('./utils/topic_initialize').initialize();

/*
memcached.set('foo', 'bar', 10000, function (err) { 
      
      console.log('Memcached....') 

      memcached.get('foo', function (err, data) {
        console.log('Memcached:'+data);
      });

});

*/



/*
if(config.env === 'production'){
    const pubsub = require('@google-cloud/pubsub')();

    pubsub.subscribe( config.topicname, config.subc_name ,{
      ackDeadlineSeconds: 90,
      autoAck: true,
      interval: 30
    }).then( data => {

      const subscription = data[0];
      

      function onError(err) {        
        log.logger('error', 'Subscription Error:'+ err);
      }

      function onMessage(message) {
        sendRT.sendRTmsg(message);        
      }

      subscription.on('error', onError);
      subscription.on('message', onMessage);


    }).catch( err => {
        console.log('Error pubsub'+ err );
        structuredLogger.emit('error', 'Subscription Error:'+ err);  
    });


}
*/


io.use(socketioutils.authenticate);

io.on('connection', function(socket){
  
  log.logger('Connection');

  socket.request.headers.user.online = true;
  socket.request.headers.user.topic = topic.name;

  let rt = {};
  rt.online = true;
  rt.topic = topic.name;
  

  memcached.set( socket.request.headers.user.id , socket.request.headers.user , 600, function (err) { });
  socket.join(socket.request.headers.user.id);
  socket.emit('join', { pid: process.pid});
  knex('user').where({id: socket.request.headers.user.id }).update(rt).then(()=>{}).catch(err=>{});
	socketioroutes.setup(socket);  

});



app.use(function(req, res, next){
  res.io = io;
  next();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', function(req, res, next){

  sendRT.sendRTmsg(req.body.data);

  return res.json({error: false});


});


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
