const configuration = require('./config.js')


const knex = require('knex')({
  client: configuration.database.db,
  connection: {
    host: configuration.database.host,
    port: configuration.database.port,
    user: configuration.database.user,
    password: configuration.database.password,
    database: configuration.database.name
  }
});
    
    
module.exports = knex
    