'use strict';

var jsonrpc      = require('multitransport-jsonrpc');
var transport = jsonrpc.transports.server.middleware;
var apiRoot = '../src/api/index';
var userInvService = require(apiRoot).UserInvService;

// Exposing invitation methods to be used without login
var resource = new jsonrpc.server(
	new transport(), {
		findOneByCode: userInvService.findOneByCode,
		update: userInvService.update
	});

module.exports = function (app) {
	app.use('/invitation', resource.transport.middleware);
};
