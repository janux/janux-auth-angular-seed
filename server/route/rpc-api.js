'use strict';

var 
	userService = require('../src/auth/user-service-mock'),
	jsonrpc     = require('multitransport-jsonrpc'),
	log = require('log4js').getLogger('sandbox')
;

var transport = jsonrpc.transports.server.middleware;

/*
var jsonrpcServer = new jsonrpc.server(
	new jsonrpc.transports.server.middleware(), {
		findByAccountName: userService.findByAccountName 
	});
*/


var users = new jsonrpc.server(new transport(), userService);

// eventually we can declare something like this, and programmatically 
// map all the services to an rpc middleware
/*
var services = {
	users: '../src/user-service-mock'
}
*/

module.exports = function (app) {
	app.use('/rpc/v1/users', users.transport.middleware);
};
