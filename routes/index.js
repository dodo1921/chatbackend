'use strict'

var express = require('express');
var router = express.Router();

const log = require('../utils/logger');

/* GET users listing. */
router.post('/', function(req, res, next){

  let data = req.body.data;

  res.io.of('/').in(data.receiver_id).clients( (error, clients)=>{     	

        if(clients.length>0)
          res.io.of('/').in(data.receiver_id).emit( data.eventname, data );        
      
  });
  log.logger('info', 'http call');
  return res.json({error: false});


});

module.exports = router;
