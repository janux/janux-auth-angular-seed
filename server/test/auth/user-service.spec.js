var
	_ = require('underscore')
	,expect = require('chai').expect
	,log4js = require('log4js')
	,should = require('should')
	,userService = require('../../src/auth/user-service')
	,util   = require('util');

var log = log4js.getLogger('test');
log4js.configure('test/log4js.json');

// utility function used in tests below
function assertWidgetDesigner(user) {
	expect(_.isObject(user)).to.equal(true);
	expect(user.username).to.equal('admin');
}

describe ('user-service:', function() {

	it ("should find 'admin' by account name", function(done) {
		userService.findByAccountName('admin', function(err, user) {
			// log.info("found user: '%s'", util.inspect(user, {depth:null}));
			log.info("found user: ", user);
			assertWidgetDesigner(user);
			done();
		});
	});
});
