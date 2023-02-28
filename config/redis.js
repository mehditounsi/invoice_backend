/*
 *   Copyright (c) 2021 B.P.S.
 *   All rights reserved.
 *   Unauthorized copying of this file, via any medium is strictly prohibited
 *   Proprietary and confidential
 *   @Written by Amine BEN DHIAB <amine@bps-tunisie.com>
 */
var redis = require('redis')
const configuration = require('./config')
require('dotenv').config()


const redis_home = configuration.redis.server
const redis_port = configuration.redis.port
// const redis_username = configuration.redis.username
// const redis_password = configuration.redis.password


let client_redis = redis.createClient(
	{
		url: `redis://${redis_home}:${redis_port}`
		// hostname:redis_home,
		// port:redis_port,
		// username:redis_username,
		// password:redis_password
		//     //host: redis_home,
		//     //port: redis_port
	}
)
client_redis.on('error', function (e) {
	connected = false
	console.log(`Can't connect to redis instance ${redis_home} on port ${redis_port}`);
	console.log(e)
});

client_redis.on('connect', function () {
	connected = true
	console.log(`Connected to redis instance ${redis_home} on port ${redis_port}`);
});

client_redis.on('ready', function () {
	console.log(`Redis instance is ready (data loaded from disk)`);
});


(async () => {
	await client_redis.connect()
})()

module.exports = client_redis