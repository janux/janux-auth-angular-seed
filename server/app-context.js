var 
	config   = require('config').serverAppContext,
	log4js   = require('log4js'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy
;

//
// This file runs after node-config is configured, and makes it possible to make programmatic changes
// to the configuration after the config file has been loaded; 
// in particular, we use it to run the log4js configuration commands below
//

// read the log4js config from node-config
log4js.configure(config.log4js.config);

// It is not possible to set the global log level via the log4js config, so we are forced to do this
// programatically; the downside is that it is not possible at this time to change this setting
// without restarting the server
log4js.setGlobalLogLevel(config.log4js.globalLogLevel);

// Watch for any changes to the customer configuration
// test how well this works this at some point
// config.watch(config, null, function(object, propertyName, priorValue, newValue) {
//   console.log('Customer configuration ' + propertyName + ' changed from ' + priorValue + ' to ' +
//   newValue);
// });

var log = log4js.getLogger('AppContext');

// TODO: inject the userService declaratively so that we can switch between 
// a mock local service during development, and a remote web service in production
var userService = require('./src/auth/user-service');

// Passport session setup
// To support persistent login sessions, Passport needs to be able to 
// serialize users into and deserialize users out of the session.
passport.serializeUser(function(user, done) {
	// log.debug('user in serializeUser: %j', user);
	done(null, user.userId);
});

passport.deserializeUser(function(userId,done) {
	// log.debug('loading user with userId', userId);
	userService.load(userId, function(err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy( { usernameField: 'username' },
	function(username, password, done) {
		log.debug('calling userService.authenticate from passport with username "%s"', username);
		return userService.authenticate(username, password, done);
	}
));

config.passport = passport;

// Simple route middleware that ensures that the user is authenticated.
// Apply to any resource that needs to be protected.
// If the request is authenticated via a persistent login session, the request will proceed.
config.authenticate = function authenticate(req, res, next) {
	log.debug('checking authentication for request: %s', req.url);
	if (req.isAuthenticated()) {
		log.debug('session is authenticated, user is: %j', req.user);
		return next();
	}
	log.debug('User is not authenticated, redirecting to login screen');
	res.redirect('/login');
};


// //
// // Very crude attempt at creating a Dependency Injection mechanism;
// // for the time-being it enables us to 'inject' the impl of services via node-config
// //
// var baseConfig = config.service.common;
//
// var userServiceConfig = Object.create(baseConfig);
// userServiceConfig.contextPath = config.service.user.contextPath;
// 
// config.userService = require(config.service.user.impl).singleton(userServiceConfig);
// 
// var propertyServiceConfig = Object.create(baseConfig);
// propertyServiceConfig.contextPath = config.service.property.contextPath;
// 
// config.propertyService = require(config.service.property.impl).singleton(propertyServiceConfig);
//
// // TODO: update the authorization-service to implement the ServiceFactory pattern
// config.authService = require('./src/authorization-service').singleton();

// uncomment to troubleshoot if log4js is not configuring properly
// console.log('config is %j', config);


log.trace('Application Context is %j: ', config);

module.exports = config;

log.info('Application Context created');
