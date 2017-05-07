'use strict';

module.exports = {
  
  development: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'test'
      
    }
    pool: { min: 0, max: 7 }
  },

  production: {
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      user : 'root',
      password : '',
      database : 'gamechat'
    },
    pool: { min: 0, max: 7 }
  }
  
};

