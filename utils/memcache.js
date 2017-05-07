'use strict'

const  Memcached = require('memcached');
const memcached = new Memcached('10.146.0.2:11211');

module.exports = memcached; 