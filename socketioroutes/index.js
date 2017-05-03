'use strict'

var controllers = require('../controllers');

var sockerioroutes = module.exports = {
  
  setup: function(socket, topic){

  	socket.on('publish', controllers.publish(packet, callback));


  	socket.on('omg', (packet) => {
  		console.log('>>>>>>omg:'+packet.x);
  	});


  	socket.on('disconnect', () => {

  		console.log('Disconnected');
  		//socket.leave('omg');

  	});

  }
  
    	
};