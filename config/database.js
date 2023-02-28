const env = process.env.NODE_ENV;
const knexfile = require('./../knexfile');
const knex = require('knex')(knexfile[env]);

module.exports = knex;