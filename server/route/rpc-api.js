'use strict';

var
	jsonrpc     = require('multitransport-jsonrpc'),
	log = require('log4js').getLogger('sandbox')
;

var transport = jsonrpc.transports.server.middleware;

var srcRoot = '../src/api/';

var pathMappings = {
	users:	'user-resource'
};

/*
var jsonrpcServer = new jsonrpc.server(
	new jsonrpc.transports.server.middleware(), {
		findByAccountName: userService.findByAccountName 
	});
*/

module.exports = function(app) {
	for (var path in pathMappings) {
		var resource = new jsonrpc.server(new transport(), require(srcRoot + pathMappings[path]));
		app.use('/rpc/2.0/' + path, resource.transport.middleware);
	}
};
