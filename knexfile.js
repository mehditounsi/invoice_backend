require('dotenv').config({ path: './config/.env' });
const configuration = require('./config/config')


module.exports = {
    development: {
        client: configuration.database.db,
        connection: {
          host: configuration.database.host,
          port: configuration.database.port,
          user: configuration.database.user,
          password: configuration.database.password,
          database: configuration.database.name
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: `${__dirname}/database/migrations`,
        },
        seeds: {
            directory: `${__dirname}/database/seeds`,
        },
    },
};
