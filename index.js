require('dotenv').config()
var httpContext = require('express-http-context');




const express = require('express');
const winston = require('winston');

var morgan = require('morgan')
const responseTime = require('response-time')

let Ratelimiter = require("./helpers/limiter")


const app = express();

const http = require('http');
const https = require('https');
const fs = require('fs');

const httpPort = 3000;  

const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require("helmet");
const { Server } = require("socket.io");


app.use(morgan('dev'))

app.use(cors());

app.use((req, res, next) => {
  httpContext.ns.bindEmitter(req);
  httpContext.ns.bindEmitter(res);
  next();
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

app.use(bodyParser.json());
app.use(httpContext.middleware);
app.use(Ratelimiter.limiter());
app.use(responseTime())

app.use(helmet())



require('./helpers/logging')();
require('./routes/invoice')(app);
require('./routes/user')(app);
require('./routes/admin')(app);
require('./routes/swagger')(app);



var httpServer = http.createServer(app)


const  io = new Server(httpServer, {
  cors: {
    origin: "*",
   },
});


io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on('configure-user',(payload) =>{
       socket.join(payload.company_id)
    })
 });


httpServer.listen(httpPort, () => {
  console.log("Http server listing on port : " + httpPort)
});


// Gracefull shutdown


process.on('SIGTERM', gracefullShutDown);
process.on('SIGINT', gracefullShutDown);

global.io = io

function gracefullShutDown() {
  console.log('Received kill signal, shutting down gracefully');
  httpServer.close(() => {
    console.log('Closed out remaining connections');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

}


module.exports = httpServer;