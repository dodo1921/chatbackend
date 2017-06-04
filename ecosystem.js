module.exports = {
  apps : [{
    name        : "chat",
    script      : "./worker.js",
    watch       : true,
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
       "NODE_ENV": "production"
    }
  }]
}