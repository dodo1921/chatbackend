'use strict'

var controllers = require('../controllers');

var sockerioroutes = module.exports = {
  
  setup: function(socket, topic){

  	//socket.on('publish', controllers.publish(packet, callback));





  	socket.on('disconnect', () => {

  		console.log('Disconnected');
  		//socket.leave('omg');

  	});

  }
  
    	
};