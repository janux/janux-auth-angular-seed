'use strict';

var 
	log = require('log4js').getLogger('Server'),
	appContext   = require('../app-context')
	// authenticate = require('../app-context').authenticate
;

var index = function(req, res) {
		/*
		if (req.user) { 
			log.debug("adding user to response cookie");
			res.cookie('user', JSON.stringify(req.user));
		};
		*/
		res.sendfile('index.html', {root: appContext.server.distFolder});
};

module.exports = function(app) {

	app.get('/', index);

	// partials are served by their name
	/*
	app.get('/partials/:name', function (req, res) {
		res.render('partials/' + req.params.name);
	});
	*/

	// module-specific routes
	require('./auth')(app);
	// require('./api' )(app);

	//// application defaults
	//
	// map a path to a template by the same name.
	// If the angular app is deployed at the root '/', this should not be used
	// because it will break the app (unless every view of the angular app is
	// explicitly mapped above)
	//
	/*
	app.get('/:name', function (req, res) {
		res.render(req.params.name);
	});
	*/

	//
	// alternatively, redirect any unknown url to the index page
	// app.get('*', authenticate, index);
	//
	app.get('*', index);
};