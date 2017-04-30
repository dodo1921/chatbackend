'use strict'

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes');


const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);


const socketioutils = require('./utils/socketioutils');
const socketioroutes = require('./socketioroutes');

/*
const pubsub = require('@google-cloud/pubsub')();

const knex = require('./util/knex');

const topic = pubsub.createTopic('')
									.then( data => {

									})	
									.catch( err => {

									});

pubsub.subscribe(topic, {
  ackDeadlineSeconds: 90,
  autoAck: true,
  interval: 30
}).then( data => {

	})
	.catch( err => {

	});

 function(err, subscription, apiResponse) {
  // Register listeners to start pulling for messages.
  function onError(err) {}
  function onMessage(message) {

  			const room = io.sockets.adapter.rooms['my_room'];
				return room.length > 0;

  }
  subscription.on('error', onError);
  subscription.on('message', onMessage);

  // Remove listeners to stop pulling for messages. 

  
});

*/

io.use(socketioutils.authenticate);

io.on('connection', function(socket){

  console.log('a user connected');
  socket.emit('join', { pid: process.pid});
	socketioroutes.setup(socket, 'topic');

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
