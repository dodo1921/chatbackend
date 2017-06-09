'use strict'

const  Memcached = require('memcached');
const config = require('./config')
const memcached = new Memcached(config.memcached+':11211');

module.exports = memcached; 