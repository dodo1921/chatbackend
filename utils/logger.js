'use strict'

const structuredLogger = require('fluent-logger').createFluentSender('myapp', {
  host: 'localhost',
  port: 24224,
  timeout: 3.0
});


module.exports = structuredLogger;