var _    = require('lodash')
	cfg    = require('config'),
	expect = require('chai').expect,
	log4js = require('log4js'),
	should = require('should'),
	util   = require('util'),
	userService = require('../../src/api/user-service');

var log = log4js.getLogger('test');
log4js.configure(cfg.serverAppContext.log4js.config);

describe ('user-service:', function() {

	it("should return a user by its name", function(done) {
		userService.findByUsername('admin', function(err, response) {
			if (err) (log.error('error: %j', err));
			log.info('response: %j', response);
			done();
		});
	});

	it("should return a user by specifying the corresponding field and its name", function(done) {
		userService.findBy('username','admin', function(err, response) {
			if (err) (log.error('error: %j', err));
			log.info('response: %j', response);
			done();
		});
	});

	it("should delete a user by id", function(done) {
		userService.deleteUser('8be24a60-3ac1-4414-abb0-b6739bbd0069', function(err, response) {
			if (err) (log.error('error: %j', err));
			log.info('response: %j', response);
			done();
		});
	});

});