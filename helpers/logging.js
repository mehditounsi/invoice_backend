const winston = require('winston');
require('express-async-errors');
let configuration = require('../config/config')
const KnexTransport = require('winston-knex')



module.exports = function () {


  winston.exceptions.handle(
    new winston.transports.Console({ colorize: true, prettyPrint: true, }),
    new winston.transports.File({ filename: './logs/uncaughtExceptions.log' })
  );

  process.on('unhandledRejection', (ex) => {
    throw ex;
  });

  if (configuration.logs.knex === 'y') {
/*   winston.createLogger({
    level: 'error',
    transports: [
      new KnexTransport({
        client: configuration.database.db,
        connection: 'mysql://root:root@127.0.0.1:3306/invoicing',
        tableName: 'logs' // defaults to `logs`
        // this config also accepts any knex configuration key/params
      })
    ]
  }) */
  }

  if (configuration.logs.file === 'y') {
    winston.add(
      new winston.transports.File({
        level: configuration.logs.file_level,
        filename: configuration.logs.file_path,
        format: winston.format.combine(winston.format.json(), winston.format.timestamp()),
      })
    );
  }

  if (configuration.logs.console === "y") {
    winston.add(
      new winston.transports.Console({
        level: configuration.logs.console_level,
        colorize: true,
        prettyPrint: true,
      })
    )
  }

}