'use strict';

var jsonrpc      = require('multitransport-jsonrpc');
var transport = jsonrpc.transports.server.middleware;
var apiRoot = '../src/api/index';
var userActionService = require(apiRoot).UserActionService;
var userService = require(apiRoot).UserService;

// Exposing invitation methods to be used without login
var resource = new jsonrpc.server(
	new transport(), {
		recoverPassword: userActionService.recoverPassword,
		findOneByUsernameOrEmail: userService.findOneByUsernameOrEmail,
		findOneByCode: userActionService.findOneByCode,
		update: userActionService.update
	});

module.exports = function (app) {
	app.use('/rpc/public/userAction', resource.transport.middleware);
};
