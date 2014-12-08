var 
	_ = require("underscore")
	,expect = require("chai").expect
	,should = require("chai").should()
	,log4js = require("log4js")
;

var 
   PermissionHolder  = require("../lib/PermissionHolder")
	,PermissionContext = require("../lib/PermissionContext")
;
var log = log4js.getLogger("PermissionHolder_test");


describe ('PermissionHolderSetup', function() {
	// default timeout is 2000 ms
	// this.timeout(30000)  
  var TYPE_NAME = "janux.security.PermissionHolder";
	var permHolder, permContext;

	// run once before the test suite below
	before(function() {
		permContext = PermissionContext.createInstance("PERSON", "Defines permissions available on a Person entity");
		permContext.addPermissionBit("READ",   "Grants permission to READ a PERSON");
		permContext.addPermissionBit("UPDATE", "Grants permission to UPDATE a PERSON");
		permContext.addPermissionBit("CREATE", "Grants permission to CREATE a PERSON");
		permContext.addPermissionBit("TRASH",  "Grants permission to TRASH a PERSON");
		permContext.addPermissionBit("DELETE", "Grants permission to DELETE a PERSON");
	});

	describe ('PermissionHolder', function() {

		beforeEach(function() {
			permHolder = PermissionHolder.createInstance();
		});

		it("should instantiate with basic fields", function() {
			log.debug("permHolder after creation: %j", permHolder);
			permHolder.typeName.should.equal(TYPE_NAME);
			// expect(permHolder.spec()).to.be.instanceof(Object);
		});

		it("typeName should be immutable", function() {
			permHolder.typeName.should.equal(TYPE_NAME);
			permHolder.typeName = "somethingElse";
			permHolder.typeName.should.equal(TYPE_NAME);
		});


		function assertPermissions(permHolder) {
			permHolder.hasPermission("READ", "PERSON").should.be.true;
			permHolder.hasPermissions(["READ","UPDATE"] , "PERSON").should.be.true;
			permHolder.hasPermissions(["READ","UPDATE","DELETE"] , "PERSON").should.be.true;

			permHolder.hasPermission("CREATE" , "PERSON").should.be.false;
			permHolder.hasPermissions(["READ","UPDATE","CREATE"] , "PERSON").should.be.false;
			permHolder.hasPermissions(["READ","UPDATE","CREATE","DELETE"] , "PERSON").should.be.false;
		}

		it("should be possible to grant permissions to a PermissionHolder using an array of strings", function() {
			permHolder.grantPermissions(["READ","UPDATE", "DELETE"], permContext);
			assertPermissions(permHolder);
		});

		it("should be possible to grant permissions to a PermissionHolder using a number", function() {
			permHolder.grantPermissions(parseInt("10011",2), permContext);
			assertPermissions(permHolder);
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


