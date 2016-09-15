'user strict';

var
	_     = require('underscore'),
	log4js = require('log4js'),
	util = require('util'),
	md5 = require('MD5'),
	AuthService = require('./authorization-service'),
	userDAO = require('janux-people.js').UserDAO.createInstance('../server/janux-people.db'),
	userService = require('janux-people.js').UserService.singleton(userDAO);

var log = log4js.getLogger('Auth UserService');

var service = {

	load: function load(oid, done) {
		// log.debug('calling findByOid with oid: '%s'',oid);
		'use strict';

		userService.findById(oid).then( function(user){
			if(user){
				done(null, user);
			}else{
				var msg = util.format('User with oid: "%s" does not exist', oid);
				log.error(msg);
				done(new Error(msg));
			}
		});
	},

	findByAccountName: function findByAccountName(username, done) {
		'use strict';
		log.debug('looking up account with name "%s"', username);

		userService.findByUsername(username).then( function(user) {
			if(user){
				done(null, user);
			}else{
				var msg = util.format('User with username: "%s" does not exist', username, user);
				log.error(msg);
				done(new Error(msg));
			}
		});
	},

	/*
	 * Given a valid username/password combination, returns the corresponding user.
	 * throws an error otherwise
	 */
	authenticate: function authenticate(username, password, done) {
		'use strict';

		service.findByAccountName(username, function(err, user) {
			if (err) {
				return done(err);
			} else if (_.isObject(user) && user.password === md5(password)) {
				AuthService.loadRoleByName(user.role).then(function(role) {
					user.role = role;
					return done(null, user);
				});

			} else {
				var msg = util.format('Invalid username/password supplied by "%s"', username);
				log.warn(msg);
				return done(null, false, { message: msg });  // return 'false' for failure to authenticate (rather than a null user)
			}
		});
	}
};

module.exports = service;