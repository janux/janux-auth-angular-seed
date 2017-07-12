'user strict';

var
    _ = require('underscore'),
    // Q    = require('q'),
    Promise = require('bluebird'),
    log4js = require('log4js'),
    util = require('util'),
    md5 = require('MD5'),
    AuthService = require('../api/index').AuthService; // require('./authorization-service'),

var log = log4js.getLogger('Auth UserService');
var UserService = require('janux-persistence').UserService;

var service = {

    load: function load(oid, done) {
        // log.debug('calling findByOid with oid: '%s'',oid);
        'use strict';

        UserService.findOneByUserId(oid)
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

		/*userService.findById(oid, function(err, user){
		 if(err){
		 throw new Error(err);
		 }

		 if(user){
		 done(null, user);
		 }else{
		 var msg = util.format('User with oid: "%s" does not exist', oid);
		 log.error(msg);
		 done(new Error(msg));
		 }
		 });*/
    },

    findByAccountName: function findByAccountName(username, done) {
        'use strict';
        log.debug('looking up account with name "%s"', username);

        UserService.findOneByUserName(username)
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

		/*userService.findByUsername(username, function(err, user) {
		 if(user){
		 done(null, user);
		 }else{
		 var msg = util.format('User with username: "%s" does not exist', username, user);
		 log.error(msg);
		 done(new Error(msg));
		 }
		 });*/
    },

	/*
	 * Given a valid username/password combination, returns the corresponding user.
	 * throws an error otherwise
	 */
    authenticate: function authenticate(username, password, done) {
        'use strict';

        service.findByAccountName(username, function (err, user) {
            if (err) {
                return done(err);
            } else if (_.isObject(user) && user.password === md5(password)) {

                user.roles = _.map(user.roles, function (role) {
                    return AuthService.loadRoleByName(role)
                });
                Promise.all(user.roles).then(function (roles) {
                    user.roles = roles;
                    return done(null, user);
                });
                // AuthService.loadRoleByName(user.role).then(function(role) {
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