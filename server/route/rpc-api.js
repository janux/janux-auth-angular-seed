'use strict';

var
	jsonrpc     = require('multitransport-jsonrpc'),
	log = require('log4js').getLogger('sandbox')
;

var transport = jsonrpc.transports.server.middleware;

var apiRoot = '../src/api/index';

var services = {
	users:	require( apiRoot ).UserService,
	authContext:	require( apiRoot ).AuthContextService,
	role: require( apiRoot ).RoleService,
	operation: require(apiRoot).OperationService
};

/*
var jsonrpcServer = new jsonrpc.server(
	new jsonrpc.transports.server.middleware(), {
		findByAccountName: userService.findByAccountName 
	});
*/

module.exports = function(app) {
	for (var service in services) {
		var resource = new jsonrpc.server(new transport(), services[service]);
		app.use('/rpc/2.0/' + service, resource.transport.middleware);
		log.info('service created', service);
	}
};
