'use strict';

var 
	_ = require("underscore")
	,expect = require("chai").expect
	,should = require("chai").should()
	,log4js = require("log4js")
	,AuthService  = require("../lib/authorization-service")
;

var log = log4js.getLogger("AuthService_test");


describe('AuthService', function() {
	// default timeout is 2000 ms
	// this.timeout(30000)  

	describe("PROPERTY permission context", function(done) {
		var permContext = AuthService.permissionContext.PROPERTY;

		it("should have proper values", function() {
			log.debug("permContext: %j", permContext);
			expect(permContext.name).to.equal("PROPERTY");
			expect(permContext.description).to.equal("Defines permissions available on a Master Record of a Real Estate Property");

			var perms = permContext.getPermissionBitsAsList();
			expect(perms).to.have.length(5);

			perms[0].name.should.equal("READ");
			perms[0].description.should.equal("Grants permission to READ a Master Record of a Real Estate Property");
			perms[0].position.should.equal(0);
			perms[0].sortOrder.should.equal(0);

			perms[1].name.should.equal("UPDATE");
			perms[1].position.should.equal(1);
			perms[1].sortOrder.should.equal(1);

			perms[2].name.should.equal("CREATE");
			perms[2].position.should.equal(2);
			perms[2].sortOrder.should.equal(2);

			perms[3].name.should.equal("TRASH");
			perms[3].position.should.equal(3);
			perms[3].sortOrder.should.equal(3);

			perms[4].name.should.equal("DELETE");
			perms[4].position.should.equal(4);
			perms[4].sortOrder.should.equal(4);
		});
	});

	describe("EQUIPMENT permission context", function(done) {
		var permContext = AuthService.permissionContext.EQUIPMENT;

		it("should have proper values", function() {
			log.debug("permContext: %j", permContext);
			expect(permContext.name).to.equal("EQUIPMENT");
			expect(permContext.description).to.equal("Defines permissions available on a Equipment at a Property");
			var perms = permContext.getPermissionBitsAsList();
			expect(perms).to.have.length(5);

			perms[0].name.should.equal("READ");
			perms[0].description.should.equal("Grants permission to READ a Equipment at a Property");
			perms[0].position.should.equal(0);
			perms[0].sortOrder.should.equal(0);

			perms[1].name.should.equal("UPDATE");
			perms[1].position.should.equal(1);
			perms[1].sortOrder.should.equal(1);

			perms[2].name.should.equal("CREATE");
			perms[2].position.should.equal(2);
			perms[2].sortOrder.should.equal(2);

			perms[3].name.should.equal("TRASH");
			perms[3].position.should.equal(3);
			perms[3].sortOrder.should.equal(3);

			perms[4].name.should.equal("DELETE");
			perms[4].position.should.equal(4);
			perms[4].sortOrder.should.equal(4);
		});
	});

	// assertions
	// see http://chaijs.com/api/bdd
	// some_prop.should.equal('somevalue'); // fails if some_prop is null
	// some_prop.should.have.length(3); 
	// some_prop.should.be.a('string');
	// some_prop.should.have.property;
	//
	// expect(something).to.be.empty|true|false|null|undefine;
	// expect(something).to.be.not.empty;
	// expect(something).to.equal(some_value);
	// expect(something).to.be.instanceof(Array|String|Number|Function|Object);

});

