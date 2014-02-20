'use strict';

/**
 * This is the main run script that configures and starts the express server
 */
var 
	express       = require('express'),
	// flash         = require('connect-flash'),
	http          = require('http'),
	log4js        = require('log4js')
;

var
	authenticate = require('./route/auth').authenticate,
	appContext   = require('./app-context'),
	passport     = appContext.passport
;

// Logging config is done via 'config' package in config/default.js via property config.log4js; 
// it is also being initialized programmatically in app-context.js
var log = log4js.getLogger('Server');

var app = module.exports = express();

// Express Configuration
app.configure(function(){
	app.set('port', appContext.server.port);
	// app.set('views', appContext.server.distFolder);
	// app.set('views', __dirname + '/views');
	// app.set('view engine', 'jade');
	app.use(express.logger());
	app.use(express.bodyParser());
	app.use(express.cookieParser('lucy in the sky'));
	app.use(express.cookieSession());
	app.use(express.methodOverride());
	// app.use(express.session( { secret: 'lucy in the sky' }));
	// app.use(express.static(__dirname + '/public'));
	
	// serve static assets from '/static' context path
	app.use(appContext.server.staticUrl, express.static(appContext.server.distFolder));

	// not technically necessary, we seem to be serving the favicon.ico just fine without this
	// app.use(express.favicon(appContext.server.distFolder + '/favicon.ico'));

	app.use(passport.initialize());
	app.use(passport.session()); // supports persistent login sessions
	// app.use(flash()); // used to pass messages on failed login
	app.use(app.router);
});

// standard error handler, catches unhandled errors and returns a nicely formatted 500 error
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

// route configuration, see route/index.js for details
require('./route')(app);

// Start server
var server = http.createServer(app);
server.on('error', function() {
	console.log("Error on express server port '%s': %j", app.get('port'), arguments); 
});

server.on('listening', function() {
	console.log("janux-auth-seed listening on port '%d' in '%s' mode", this.address().port, app.settings.env);
	// console.log("Connected to back-end at: '%s'", appContext.service.common.baseUrl);
});

server.listen(app.get('port'));
log.trace("app.routes: ", app.routes);
