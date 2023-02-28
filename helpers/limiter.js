require('dotenv').config()
const rateLimit = require('express-rate-limit')


module.exports.limiter = (max_request = 500, window = 5 , delayAfter = 450 , delay = 8) => { 
    return rateLimit({
      windowMs: window * 60 * 1000,
      delayAfter: delayAfter,
      delayMs: delay * 1000 ,
      max: max_request,
      message: `you have exceeded the limit of requests, try again in  ${window} minutes`,
      standardHeaders: true,
      legacyHeaders: false,
    })
  }