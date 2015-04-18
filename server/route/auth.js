'use strict';

var 
	authenticate = require('../src/auth/authentication-handler')
	// authorize    = require('../src/authorization-service')
;

module.exports = function (app) {
	app.post('/login' , authenticate.login);
	app.post('/logout', authenticate.logout);

	app.get('/current-user', authenticate.sendCurrentUser);

	app.get('/authenticated-user', function(req, res) {
		authenticate.authenticationRequired(req, res, function() {
			authenticate.sendCurrentUser(req, res);
		});
	});

	/*
	// TODO: fix this, since we are using promises
	app.get('/authenticationContexts', function(req, res) {
		return authorize.loadAuthorizationContexts();
	});

	app.get('/roles', function(req, res) {
		return authorize.loadRoles();
	});
	*/
};
