'use strict';

var 
	log   = require('log4js').getLogger('Server'),
	appContext = require('../app-context'),
	auth = require('../lib/security');
;

module.exports = function (app) {
	app.post('/login', auth.login);
	app.post('/logout', auth.logout);

	app.get('/current-user', auth.sendCurrentUser);

	app.get('/authenticated-user', function(req, res) {
		auth.authenticationRequired(req, res, function() {
			auth.sendCurrentUser(req, res);
		});
	});

};
