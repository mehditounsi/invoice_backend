var httpContext = require('express-http-context');
var jwt = require('jsonwebtoken');
const { User } = require('../models')
const configuration = require('../config/config')
// const redis_client = require('../config/redis');
const Errors = require('../helpers/errors');
const UserService = require('../services/user');
const Logger = require("winston");

const JWT_SIGN_SECRET = "" + configuration.jwt.jwt_secret;

// Exported functions
module.exports = {
  generateTokenForUser: async function (_token) {
    try {
      var token = module.exports.parseAuthorization(_token);
      if (token == null) throw new Errors.InvalidDataError('No value for token')
      const jwtToken = jwt.decode(token);
      let _user = await User.findByUid(jwtToken.user_id)
      if (_user) {
        httpContext.set('gUser', _user)
        httpContext.set('gCompanyId', _user.company_id)

        return jwt.sign({
          userId: _user.id,
          role: _user.role,
          firebaseToken: token,
          userUID: _user.uid,
          companyId: _user.company_id,
          login: _user.login
        },

          JWT_SIGN_SECRET,
          {
            expiresIn: '1200h'
          })
      } else {
        let data = {
          company: {
            name: jwtToken.email.split('@')[0],
          },
          user: {
            name: jwtToken.email.split('@')[0],
            login: jwtToken.email,
            uid: jwtToken.user_id,
            role: "user"
          }
        }
        try {
          let user = await UserService.register(data)

          httpContext.set('gUser', user.user)
          httpContext.set('gCompanyId', user.user.company_id)

          return jwt.sign({
            userId: user.user.id,
            role: user.user.role,
            firebaseToken: token,
            userUID: user.user.uid,
            companyId: user.user.company_id,
            login: user.user.login
          },

            JWT_SIGN_SECRET,
            {
              expiresIn: '1200h'
            })
        } catch (e) {
          console.log(e);
          Logger.error(e)
          throw e
        }
      }
    } catch (error) {
      console.log(error)
      Logger.error(error)
      throw error
    }
  },
  generateTokenForAdmin: async function(username){
    try {
      return jwt.sign({
        login: username,
      },
  
        JWT_SIGN_SECRET,
        {
          expiresIn: '1200h'
        })
    } catch (error) {
      console.log(error)
      Logger.error(error)
      throw error
    }
  },
  parseAuthorization: function (authorization) {
    return (authorization != null) ? authorization.replace('Bearer ', '') : null;
  },
  // --------------- Get User ID from Token -------------
  getUserId: function (authorization) {
    var user_id = -1;
    var token = module.exports.parseAuthorization(authorization);
    if (token != null) {
      try {
        var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
        if (jwtToken != null)
          user_id = jwtToken.userId;
      } catch (err) { }
    }
    // httpContext.get('gUserID', jwtToken.userId) = user_id
    return user_id;
  },
  // ------------ Verifiy Authentication -------------
  isAuthorized: async function (req, res, next) {
    var auth = req.headers['authorization'];
    var token = module.exports.parseAuthorization(auth);
    if (token == null) return res.status(402).send("Access denied. No token provided.");
    try {
      const jwtToken = jwt.decode(token);
      let currentDate = Date.now()
      // if (jwtToken.exp > currentDate) {
      if (jwtToken != null && jwtToken.userId) {
        req.user = {
          id: jwtToken.userId
        }

        // try {
        //   let check_BL = await redis_client.get(`BL_${token}`)
        //   if (check_BL)
        //     return res.status(401).json({ status: false, message: 'Blacklisted token' });
        // } catch (error) {
        //   console.log(error)
        // }

        if (jwtToken) {
          httpContext.set('token', jwtToken.firebaseToken)
          httpContext.set('gUserIP', req.clientIp)
          httpContext.set('gUserUId', jwtToken.userUID)
          httpContext.set('gUserId', jwtToken.userId)
          httpContext.set('gUserLogin', jwtToken.login)
          httpContext.set('gCompanyId', jwtToken.companyId)

          // req.body.context = context

          //httpContext.set('gUserIP', req.connection.remoteaddress)
          next();
        }
        else {
          res.status(402).send("user not found.");
        }
      }
      else {
        res.status(402).send("Token = null");
      }
      // } else {
      //   res.status(402).send("expired Token");

      // }
    } catch (ex) {
      console.log(ex);
      res.status(402).send("Invalid token.");
    }
  },
  // ------------ Verifiy Authentication -------------
  isAdmin: function (req, res, next) {
    var auth = req.headers['authorization'];
    var token = module.exports.parseAuthorization(auth);
    if (!token) return res.status(402).send("Access denied. No token provided.");
    try {
      const jwtToken = jwt.decode(token);
      if (jwtToken != null)
        if (jwtToken.login !== "root") {
          res.status(402).send("Access denied. need more rights.")
        };
      next();
    } catch (ex) {
      res.status(402).send("Invalid token.");
    }
  }
}



