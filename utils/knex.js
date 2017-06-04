'use strict'
const config = require('./config');
const environment = config.env || 'development';
const databaseconf = require('../knexfile.js')[environment];

module.exports = require('knex')(databaseconf);