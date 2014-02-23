var 
	_ = require("underscore")
	,expect = require("chai").expect
	,log4js = require("log4js")
	,should = require("should")
	,userService = require("../lib/UserServiceMock")
  ,util   = require("util")
;

var log = log4js.getLogger("test");
log4js.configure('test/log4js.json');

// utility function used in tests below
function assertOwner(user) {
	expect(_.isObject(user)).to.equal(true);
	user.account.name.should.equal("owner");
	user.person.name.first.should.equal("Chase");
	user.person.name.last.should.equal("Danford");
}

function assertDealer(user) {
	expect(_.isObject(user)).to.equal(true);
	user.account.name.should.equal("dealer");
	user.person.name.first.should.equal("Robby");
	user.person.name.last.should.equal("Dealer");
}

function assertAdmin(user) {
	expect(_.isObject(user)).to.equal(true);
	user.account.name.should.equal("admin");
	user.person.name.first.should.equal("Philippe");
	user.person.name.last.should.equal("Admin");
}

describe ('user-service-mock:', function() {

	it("should load 'owner' by oid", function(done) {
		var oid = "e90597ae-6450-49f5-8b72-3c0b1a6e8c4f";
		userService.load(oid, function(err, user) {
			user.oid.should.equal(oid);
			assertOwner(user);
			done();
		});
	});


	it ("should find 'owner' by account name", function(done) {
		userService.findByAccountName("owner", function(err, user) {
			// log.info("found user: '%s'", util.inspect(user, {depth:null}));
			log.info("found user: '%j'", user);
			assertOwner(user);
			done();
		});
	});

	it ("should authenticate 'owner' credential", function(done) {
		userService.authenticate("owner","test", function(err, user) {
			// log.info("found user: '%j'", user);
			assertOwner(user);
			done();
		});
	});


	it("should load 'dealer' by oid", function(done) {
		var oid = "3d52f4bc-34a5-47fe-8f95-6a4c5f46f300";
		userService.load(oid, function(err, user) {
			user.oid.should.equal(oid);
			assertDealer(user);
			done();
		});
	});


	it ("should find 'dealer' by account name", function(done) {
		userService.findByAccountName("dealer", function(err, user) {
			// log.info("found user: '%j'", user);
			assertDealer(user);
			done();
		});
	});

	it ("should authenticate 'dealer' credential", function(done) {
		userService.authenticate("dealer","d3al3r", function(err, user) {
			// log.info("found user: '%j'", user);
			assertDealer(user);
			done();
		});
	});


	it("should load 'admin' by oid", function(done) {
		var oid = "8a0ca988-63b0-4218-9511-1f1b03456c0c";
		userService.load(oid, function(err, user) {
			user.oid.should.equal(oid);
			assertAdmin(user);
			done();
		});
	});


	it ("should find 'admin' by account name", function(done) {
		userService.findByAccountName("admin", function(err, user) {
			// log.info("found user: '%j'", user);
			assertAdmin(user);
			done();
		});
	});

	it ("should authenticate 'admin' credential", function(done) {
		userService.authenticate("admin","1234567", function(err, user) {
			// log.info("found user: '%j'", user);
			assertAdmin(user);
			done();
		});
	});


	it ("should return an error if oid not found", function(done) {
		userService.load("someFakeOid", function(err, user) {
			err.message.should.equal("User with oid: 'someFakeOid' does not exist");
			done();
		});
	});

	it ("should return null if account name not found", function(done) {
		userService.findByAccountName("someFakeName", function(err, user) {
			expect(_.isUndefined(user)).to.equal(true);
			done();
		});
	});


});
