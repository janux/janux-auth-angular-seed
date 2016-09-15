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

	it("should return all projects for a specific user id", function(done) {
		userService.findByUsername('admin', function(err, response) {
			if (err) (log.error('error: %j', err));
			log.info('response: %j', response);
			done();
		});
	});

});