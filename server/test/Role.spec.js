var 
	_ = require("underscore")
	,expect = require("chai").expect
	,should = require("chai").should()
	,log4js = require("log4js")
	,util = require("util")
;

var 
  Role = require("../lib/Role")
	,PermissionContext = require("../lib/PermissionContext")
;
var log = log4js.getLogger("Role_test");


describe ('', function() {
	// default timeout is 2000 ms
	// this.timeout(30000)  
	var role = {};
  var TYPE_NAME = "janux.security.Role";
	var ROLE_NAME = "HUMAN_RESOURCES_MANAGER";
	var ROLE_DESCR = "Can view, modify, create and delete personel records";
	var personPermContext;
	var accountPermContext;
	var permBits = ["READ", "UPDATE", "CREATE", "TRASH", "DELETE"];

	// run once before the test suite below
	before(function() {
		personPermContext = PermissionContext.createInstance("PERSON", "Defines permissions available on a Person entity");

		permBits.forEach( function(bitName) {
			personPermContext.addPermissionBit(bitName, util.format('Grants permission to %s a %s', bitName, "PERSON"));
		});

		// equivalent to:

		/*
		personPermContext.addPermissionBit("READ",   "Grants permission to READ a PERSON");
		personPermContext.addPermissionBit("UPDATE", "Grants permission to UPDATE a PERSON");
		personPermContext.addPermissionBit("CREATE", "Grants permission to CREATE a PERSON");
		personPermContext.addPermissionBit("TRASH",  "Grants permission to TRASH a PERSON");
		personPermContext.addPermissionBit("DELETE", "Grants permission to DELETE a PERSON");
		*/

		accountPermContext = PermissionContext.createInstance("ACCOUNT", "Defines permissions available on an Account entity");
		["READ", "UPDATE", "CREATE", "TRASH", "DELETE"].forEach( function(bitName) {
			accountPermContext.addPermissionBit(bitName, util.format('Grants permission to %s a %s', bitName, "ACCOUNT"));
		});

	});

	function assertPermissions(role) {
		role.hasPermission("READ", "PERSON").should.be.true;
		role.hasPermissions(["READ","UPDATE"] , "PERSON").should.be.true;
		role.hasPermissions(["READ","UPDATE","TRASH"] , "PERSON").should.be.true;

		role.hasPermission("CREATE","PERSON").should.be.false;
		role.hasPermissions(["READ","UPDATE","CREATE"] , "PERSON").should.be.false;
		role.hasPermissions(["READ","UPDATE","CREATE","DELETE"] , "PERSON").should.be.false;


		role.hasPermission("READ", "ACCOUNT").should.be.true;
		role.hasPermissions(["READ","UPDATE"] , "ACCOUNT").should.be.true;

		role.hasPermission("CREATE" , "ACCOUNT").should.be.false;
		role.hasPermissions(["READ","UPDATE","CREATE"] , "ACCOUNT").should.be.false;
		role.hasPermissions(["READ","UPDATE","CREATE","DELETE"] , "ACCOUNT").should.be.false;
	}

	describe('Role', function() {

		beforeEach(function() {
			role = Role.createInstance(ROLE_NAME, ROLE_DESCR);
		});

		it("should instantiate with basic fields", function() {
			log.debug("role after creation: %j", role);
			role.typeName.should.equal(TYPE_NAME);
			role.name.should.equal(ROLE_NAME);
			role.description.should.equal(ROLE_DESCR);
			role.sortOrder.should.equal(0);
		});

		it("typeName should be immutable", function() {
			role.typeName.should.equal(TYPE_NAME);
			role.typeName = "somethingElse";
			role.typeName.should.equal(TYPE_NAME);
		});

		it("typeName should be immutable", function() {
			role.typeName.should.equal(TYPE_NAME);
			role.typeName = "somethingElse";
			role.typeName.should.equal(TYPE_NAME);
		});

		it("should be possible to grant permissions to a Role", function() {
			role.grantPermissions(["READ","UPDATE","TRASH"], personPermContext)
				.grantPermissions(["READ","UPDATE"], accountPermContext);

			log.info("role after granting permissions: %j", role);
			assertPermissions(role);
		});

		it("should have multiple role instances without collisions", function() {
			var role2 = Role.createInstance("HR2");

			role.grantPermissions(["READ","UPDATE", "DELETE"], personPermContext);
			role2.grantPermissions(["READ"], personPermContext);

			role2.hasPermission("READ",   "PERSON").should.be.true;
			role2.hasPermission("UPDATE", "PERSON").should.be.false;
			role2.hasPermission("DELETE", "PERSON").should.be.false;

			role.hasPermissions(["READ","UPDATE"] , "PERSON").should.be.true;
			role.hasPermissions(["READ","UPDATE","DELETE"] , "PERSON").should.be.true;

			role2.hasPermissions(["READ","UPDATE"] , "PERSON").should.be.false;
			role2.hasPermissions(["READ","UPDATE","DELETE"] , "PERSON").should.be.false;
		});

		it("that is almighty should be able to have all permissions", function() {
			role.isAlmighty = true;
			log.info("role after granting almightiness: %j", role);

			role.hasPermission("READ", "PERSON").should.be.true;
			role.hasPermissions(["READ","UPDATE"] , "PERSON").should.be.true;
			role.hasPermissions(["READ","UPDATE","TRASH"] , "PERSON").should.be.true;

			role.hasPermissions(["READ","UPDATE","CREATE"] , "PERSON").should.be.true;
			role.hasPermissions(["READ","UPDATE","CREATE","DELETE"] , "PERSON").should.be.true;

			role.hasPermission("READ", "ACCOUNT").should.be.true;
			role.hasPermissions(["READ","UPDATE"] , "ACCOUNT").should.be.true;

			role.hasPermission("CREATE" , "ACCOUNT").should.be.true;
			role.hasPermissions(["READ","UPDATE","CREATE"] , "ACCOUNT").should.be.true;
			role.hasPermissions(["READ","UPDATE","CREATE","DELETE"] , "ACCOUNT").should.be.true;
		});

		it("should be deserializable via fromJSON", function() {
			role.grantPermissions(["READ","UPDATE","TRASH"], personPermContext)
				.grantPermissions(["READ","UPDATE"], accountPermContext);

			var role2 = Role.fromJSON(role.toJSON());
			role2.name.should.equal(role.name);
			role2.description.should.equal(role.description);
			assertPermissions(role2);
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


