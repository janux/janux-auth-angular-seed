var 
	_ = require('underscore')
	,expect = require('chai').expect
	,log4js = require('log4js')
	,should = require('should')
	,userService = require('../../src/auth/user-service-mock')
  ,util   = require('util')
;

var log = log4js.getLogger('test');
log4js.configure('test/log4js.json');

// utility function used in tests below
function assertWidgetDesigner(user) {
	expect(_.isObject(user)).to.equal(true);
	user.account.name.should.equal('widget');
	user.person.name.first.should.equal('Chase');
	user.person.name.last.should.equal('Widgeter');
}

function assertManager(user) {
	expect(_.isObject(user)).to.equal(true);
	user.account.name.should.equal('manager');
	user.person.name.first.should.equal('Robby');
	user.person.name.last.should.equal('Manager');
}

function assertAdmin(user) {
	expect(_.isObject(user)).to.equal(true);
	user.account.name.should.equal('admin');
	user.person.name.first.should.equal('Philippe');
	user.person.name.last.should.equal('Admin');
}

describe ('user-service-mock:', function() {

	it("should load 'widget' by oid", function(done) {
		var oid = 'e90597ae-6450-49f5-8b72-3c0b1a6e8c4f';
		userService.load(oid, function(err, user) {
			user.oid.should.equal(oid);
			assertWidgetDesigner(user);
			done();
		});
	});


	it ("should find 'widget' by account name", function(done) {
		userService.findByAccountName('widget', function(err, user) {
			// log.info("found user: '%s'", util.inspect(user, {depth:null}));
			log.info("found user: '%j'", user);
			assertWidgetDesigner(user);
			done();
		});
	});

	it ("should authenticate 'widget' credential", function(done) {
		userService.authenticate('widget','test1', function(err, user) {
			// log.info("found user: '%j'", user);
			assertWidgetDesigner(user);
			done();
		});
	});


	it("should load 'manager' by oid", function(done) {
		var oid = '3d52f4bc-34a5-47fe-8f95-6a4c5f46f300';
		userService.load(oid, function(err, user) {
			user.oid.should.equal(oid);
			assertManager(user);
			done();
		});
	});


	it ("should find 'manager' by account name", function(done) {
		userService.findByAccountName('manager', function(err, user) {
			// log.info("found user: '%j'", user);
			assertManager(user);
			done();
		});
	});

	it ("should authenticate 'manager' credential", function(done) {
		userService.authenticate('manager','test2', function(err, user) {
			// log.info("found user: '%j'", user);
			assertManager(user);
			done();
		});
	});


	it("should load 'admin' by oid", function(done) {
		var oid = '8a0ca988-63b0-4218-9511-1f1b03456c0c';
		userService.load(oid, function(err, user) {
			user.oid.should.equal(oid);
			assertAdmin(user);
			done();
		});
	});


	it ("should find 'admin' by account name", function(done) {
		userService.findByAccountName('admin', function(err, user) {
			// log.info("found user: '%j'", user);
			assertAdmin(user);
			done();
		});
	});

	it ("should authenticate 'admin' credential", function(done) {
		userService.authenticate('admin','1234567', function(err, user) {
			// log.info("found user: '%j'", user);
			assertAdmin(user);
			done();
		});
	});


	it ("should return an error if oid not found", function(done) {
		userService.load('someFakeOid', function(err, user) {
			err.message.should.equal('User with oid: "someFakeOid" does not exist');
			log.warn('The error "%s" was expected, ignore', err.message);
			done();
		});
	});

	it ('should return null if account name not found', function(done) {
		userService.findByAccountName('someFakeName', function(err, user) {
			expect(_.isUndefined(user)).to.equal(true);
			done();
		});
	});


});
