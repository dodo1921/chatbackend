'use strict'



let config = module.exports;

config.env = process.env.NODE_ENV || 'development';

config.topicname = process.env.topicname || ''; 
config.subc_name = process.env.NODE_ENV || '';



config.host = process.env.host || 'localhost';
config.user = process.env.user || 'root';
config.password = process.env.password || '';



config.memcached = process.env.memcached || 'localhost';

config.gcmkey = process.env.gcmkey || 'AAAAmD0bPtk:APA91bG78LOWQWJK4W0RsbV1fqhHKcoTtPhjMFP8z6qQ1_-FCAhrHj5yh7dmJJIphJMaRDQmn-ZNo_UHofK1l9lZpZgOZjgpkrqt-_WR76e9uFMZ-yVjVNHTF12W82iPEKp8djCRwpwp';

config.secret = process.env.secret || 'ilovescotchscotchyscotchscotch';


