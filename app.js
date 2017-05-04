'use strict'

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes');


const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
//io.set('transports', ['websocket']);

const socketioutils = require('./utils/socketioutils');
const socketioroutes = require('./socketioroutes');


const pubsub = require('@google-cloud/pubsub')();

//const knex = require('./util/knex');

const structuredLogger = require('fluent-logger').createFluentSender('myapp', {
  host: 'localhost',
  port: 24224,
  timeout: 3.0
});

const Memcached = require('memcached');
const memcached = new Memcached();

memcached.connect( '35.187.204.98:11211', function( err, conn ){
  if( err ) throw new Error( err );
  console.log( conn.server );

  memcached.set('foo', 'bar', 10000, function (err) { 
    console.log('Memcached....') 

      memcached.get('foo', function (err, data) {
        console.log('Memcached:'+data);
      });

  });



});



/*
const report = function (err, req) {
  const payload = {
    serviceContext: {
      service: 'myapp'
    },
    message: err.stack,
    context: {
      httpRequest: {
        url: req.originalUrl,
        method: req.method,
        referrer: req.header('Referer'),
        userAgent: req.header('User-Agent'),
        remoteIp: req.ip,
        responseStatusCode: 500
      }
    }
  };
  structuredLogger.emit('errors', payload);
};
*/


pubsub.subscribe( 'projects/testjewelchat/topics/topic1', 'mayukh',{
  ackDeadlineSeconds: 90,
  autoAck: true,
  interval: 30
}).then( data => {

  const subscription = data[0];

  console.log('Subscription name:'+ subscription.name);

  function onError(err) {

    console.log('Error subscription');

  }
  function onMessage(message) {

      io.to('omg').emit('join', message );   

  }
  subscription.on('error', onError);
  subscription.on('message', onMessage);


	})
	.catch( err => {
    console.log('Error pubsub'+ err );
	});



io.use(socketioutils.authenticate);

io.on('connection', function(socket){

  console.log('a user connected');
  structuredLogger.emit('info', {msg: 'Connection'});
  socket.join('omg');
  socket.emit('join', { pid: process.pid});
	socketioroutes.setup(socket, 'topic');
  /*socket.on('disconnect', () => {

      console.log('Disconnected');
      

  });*/

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
  // set locals, only providing error in development
  //res.locals.message = err.message;
  //res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({error: true, message: err.message });
});

module.exports = {app: app, server: server};
