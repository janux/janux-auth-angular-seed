'user strict';

var
	_           = require('underscore'),
	// Q    = require('q'),
	log4js      = require('log4js'),
	util        = require('util'),
	md5         = require('md5'),
	RoleService = require('../api/index').RoleService,
	UserPersistenceService = require('../api/index').UserPersistenceService,
	log         = log4js.getLogger('Auth UserService');

var service = {

	load: function load(oid, done) {
		// log.debug('calling findByOid with oid: '%s'',oid);
		'use strict';

		UserPersistenceService.findOneByUserId(oid)
			.then(function (result) {
				done(null, result);
			}, function (err) {
				var msg = util.format('User with oid: "%s" does not exist', oid);
				log.error(msg);
				done(new Error(msg));
			})
			.catch(function (err) {
				throw new Error(err);
			});
	},

	findByAccountName: function findByAccountName(username, done) {
		'use strict';
		log.debug('looking up account with name "%s"', username);

		UserPersistenceService.findOneByUserName(username)
			.then(function (result) {
				done(null, result);
			}, function (err) {
				var msg = util.format('User with username: "%s" does not exist', username);
				log.error(msg);
				done(new Error(msg));
			})
			.catch(function (err) {
				throw new Error(err);
			});
	},

	/*
	 * Given a valid username/password combination, returns the corresponding user.
	 * throws an error otherwise
	 */
	authenticate: function authenticate(username, password, done) {
		'use strict';

		service.findByAccountName(username, function (err, user) {
			if (err) {
				return done(null, false, { message:err});
			} else if (_.isObject(user) && user.password === md5(password)) {

				user.roles = _.map(user.roles, function (role) {
					return RoleService.findOneByName(role)
				});
				Promise.all(user.roles).then(function (roles) {
					user.roles = roles;
					return done(null, user);
				});
				// RoleService.findOneByName(user.role).then(function(role) {
				// 	user.roles = role;
				// 	return done(null, user);
				// });

			} else {
				var msg = util.format('Invalid username/password supplied by "%s"', username);
				log.warn(msg);
				return done(null, false, {message: msg});  // return 'false' for failure to authenticate (rather than a null user)
			}
		});
	}
};

module.exports = service;
