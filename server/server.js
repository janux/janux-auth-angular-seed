'use strict';

/**
 * This is the main run script that configures and starts the express server
 */
var _              = require('lodash'),
	express        = require('express'),
	cookieParser   = require('cookie-parser'),
	bodyParser     = require('body-parser'),
	methodOverride = require('method-override'),
	serveFavicon   = require('serve-favicon'),
	session        = require('express-session'),
	errorHandler   = require('errorhandler'),
	livereload     = require('connect-livereload'),
	// flash         = require('connect-flash'),
	http           = require('http'),
	log4js         = require('log4js')
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
app.set('port', appContext.server.port);
// app.set('views', appContext.server.distFolder);
// app.set('views', __dirname + '/views');
// app.set('view engine', 'jade');
// app.use(express.logger());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser('lucy in the sky'));

// cookieSession stores the session info encrypted in the cookie client-side
// app.use(express.cookieSession());

app.use(methodOverride());
app.use(session({
	secret: 'lucy in the sky',
	resave: true,
	saveUninitialized: true
}));

// serve static assets from '/static' context path
var staticUrl = appContext.server.staticUrl;
if (_.isString(staticUrl) && staticUrl.length > 0) {
	app.use(appContext.server.staticUrl, express.static(appContext.server.distFolder));
} else {
	app.use(express.static(appContext.server.distFolder));
}

app.use(serveFavicon(appContext.server.distFolder + '/favicon.ico'));

log.info('livereload is:', appContext.server.livereload);

if (appContext.server.livereload) {
	log.info('Using livereload');
	app.use(livereload());
}

app.use(passport.initialize());
app.use(passport.session()); // supports persistent login sessions
// app.use(flash()); // used to pass messages on failed login

// route configuration, see route/index.js for details
require('./route')(app);

// standard error handler, catches unhandled errors and returns a nicely formatted 500 error
app.use(errorHandler({dumpExceptions: true, showStack: true}));

// Start server
var server = http.createServer(app);
server.on('error', function () {
	console.log("Error on express server port '%s': %j", app.get('port'), arguments);
});

server.on('listening', function () {
	console.log("janux-auth-seed listening on port '%d' in '%s' mode", this.address().port, app.settings.env);
});

server.listen(app.get('port'));

log.trace('app.routes: ', app.routes);