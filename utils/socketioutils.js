'use strict'

var socketioutils = module.exports = {
  
  authenticate: function(socket, next){
  	console.log('OMG authenticated');
  	next();
  }


  
    	
};