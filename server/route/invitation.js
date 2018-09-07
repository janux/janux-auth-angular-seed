'use strict';

var jsonrpc      = require('multitransport-jsonrpc');
var transport = jsonrpc.transports.server.middleware;
var apiRoot = '../src/api/index';
var userInvService = require(apiRoot).UserInvService;
var userService = require(apiRoot).UserService;

// Exposing invitation methods to be used without login
var resource = new jsonrpc.server(
	new transport(), {
		recoverPassword: userInvService.recoverPassword,
		findOneByUsernameOrEmail: userService.findOneByUsernameOrEmail,
		findOneByCode: userInvService.findOneByCode,
		update: userInvService.update
	});

module.exports = function (app) {
	app.use('/rpc/public/invitation', resource.transport.middleware);
};
