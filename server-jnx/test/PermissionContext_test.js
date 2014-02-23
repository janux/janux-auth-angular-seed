var 
	_ = require("underscore")
	,expect = require("chai").expect
	,should = require("chai").should()
	,log4js = require("log4js")
	,util   = require("util")
;

var 
	PermissionContext = require("../lib/PermissionContext")
;
var log = log4js.getLogger("PermissionContext_test");


describe ('PermissionContext', function() {
	// default timeout is 2000 ms
	// this.timeout(30000)	
	var TYPE_NAME = "janux.security.PermissionContext";
	var permContext = {};

	// run before every test in the suite
	beforeEach(function() {
		permContext = PermissionContext.createInstance("PERSON", "Defines permissions available on a Person entity");
	});


	it("should instantiate with basic fields", function() {
		log.info("permContext after creation: %j", permContext);
		permContext.typeName.should.equal(TYPE_NAME);
		// expect(permContext.spec()).to.be.instanceof(Object);
	});


	it("typeName should be immutable", function() {
		permContext.typeName.should.equal(TYPE_NAME);
		permContext.typeName = "somethingElse";
		permContext.typeName.should.equal(TYPE_NAME);
	});


	it("should be able to add/retrieve PermissionBits", function() {

		permContext.addPermissionBit("READ", "Grants permission to READ a PERSON");
		permContext.addPermissionBit("UPDATE", "Grants permission to UPDATE a PERSON", 99);

		log.info("permContext after adding PermissionBits: %j", permContext);
		log.info("short version of permContext: %j", permContext.toJSON(true));
		log.info("short version of permContext: %s", util.inspect(permContext.toJSON(true)));

		// the 'bit' object containing all the PermissionBits should be immutable
		expect(permContext.bit).to.be.instanceof(Object);
		permContext.bit = null;
		delete permContext.bit;
		expect(permContext.bit).to.be.instanceof(Object);

		// the individual bit object should also be immutable once created 
		// (some of its fields may not, but the reference itself is)
		permContext.bit.READ = null;
		delete permContext.bit.READ;
		expect(permContext.bit).to.be.instanceof(Object);

		var bit = permContext.bit.READ;
		expect(bit).to.be.instanceof(Object);
		bit.name.should.equal("READ");
		bit.label.should.equal("READ");
		bit.position.should.equal(0);
		bit.sortOrder.should.equal(0);

		// name and position should be immutable
		bit.name = "MutedName";
		bit.name.should.equal("READ");
		bit.position = -1;
		bit.position.should.equal(0);

		// label, description and sortOrder are mutable
		var LABEL = "View", DESCR = "View a Person record", SORT = 999;
		bit.label = LABEL;
		bit.description = DESCR;
		bit.sortOrder = SORT;
		bit.label.should.equal(LABEL);
		bit.description.should.equal(DESCR);
		bit.sortOrder.should.equal(SORT);

		// second bit has custom sortOrder
		bit = permContext.bit.UPDATE;
		expect(bit).to.be.instanceof(Object);
		bit.name.should.equal("UPDATE");
		bit.position.should.equal(1);
		bit.sortOrder.should.equal(99);

		var bits = permContext.getPermissionBitsAsList();
		expect(bits).to.be.instanceof(Array);
	});


	it("should fail when adding an invalid PermissionBit", function() {
		var err = true;
		
		// null name should fail
		try {
			permContext.addPermissionBit();
			err = false;
			log.error("Should not be able to add permBit with a null name");
		} catch (e) {
			// this is what we expect
			expect(e).to.be.instanceof(Error);
		}

		// empty name should fail
		try {
			permContext.addPermissionBit("");
			log.error("Should not be able to add permBit with an empty name");
			err = false;
		} catch (e) {
			expect(e).to.be.instanceof(Error);
		}

		// name that is not a string should fail
		try {
			permContext.addPermissionBit({});
			log.error("Should not be able to add permBit with name that is not a string");
			err = false;
		} catch (e) {
			expect(e).to.be.instanceof(Error);
		}
		
		permContext.addPermissionBit("READ");

		// duplicate name should fail
		try {
			permContext.addPermissionBit("READ");
			log.error("Should not be able to add permBit with a duplicate name");
			err = false;
		} catch (e) {
			expect(e).to.be.instanceof(Error);
		}

		// we should not get this far, cause an explicit assertion failure;
		// not sure of a better way to do this with chai
		if (!err) {
			expect("DidNot throw an Error").to.equal("Should throw an Error");
		}
	});


	it("should properly convert permission strings to numeric representations", function() {

		permContext.addPermissionBit("READ",   "Grants permission to READ a PERSON");
		permContext.addPermissionBit("UPDATE", "Grants permission to UPDATE a PERSON");
		permContext.addPermissionBit("CREATE", "Grants permission to CREATE a PERSON");
		permContext.addPermissionBit("DELETE", "Grants permission to DELETE a PERSON", 99);

		permContext.getPermissionAsNumber("READ").should.equal(1);
		permContext.getPermissionAsNumber("UPDATE").should.equal(2);
		permContext.getPermissionAsNumber("CREATE").should.equal(4);
		permContext.getPermissionAsNumber("DELETE").should.equal(8);

		permContext.getPermissionsAsNumber([]).should.equal(0);
		permContext.getPermissionsAsNumber(["READ","UPDATE","DELETE"]).should.equal(1+2+8);
		permContext.getPermissionsAsNumber(["READ","CREATE","DELETE"]).should.equal(1+4+8);

		var err = true;

		try {
			permContext.getPermissionAsNumber("REDA");
			err = false;
			log.error("Should fail to convert non-existent permission to number");
		} catch (e) {
			expect(e).to.be.instanceof(Error);
		}

		try {
			permContext.getPermissionsAsNumber(["REDA","UPDATE"]);
			err = false;
			log.error("Should fail to convert non-existent permission to number");
		} catch (e) {
			expect(e).to.be.instanceof(Error);
		}

		// we should not get this far, cause an explicit assertion failure;
		if (!err) {
			expect("DidNot throw an Error").to.equal("Should throw an Error");
		}
	});

	it("should be deserialized via fromJSON", function() {
		permContext.addPermissionBit("READ", "Grants permission to READ a PERSON");
		permContext.addPermissionBit("UPDATE", "Grants permission to UPDATE a PERSON", 99);

		// full version
		var permContext2 = PermissionContext.fromJSON(permContext.toJSON());
		permContext2.name.should.equal(permContext.name);
		permContext2.description.should.equal(permContext.description);
		for (var name in permContext.bit) {
			var bit  = permContext.bit[name];
			var bit2 = permContext2.bit[name];

			bit.position.should.equal(bit2.position);
			bit.description.should.equal(bit2.description);
			bit.sortOrder.should.equal(bit2.sortOrder);
		}

		// short version
		permContext2 = PermissionContext.fromJSON(permContext.toJSON(true));
		permContext2.name.should.equal(permContext.name);
		for (var name in permContext.bit) {
			var bit  = permContext.bit[name];
			var bit2 = permContext2.bit[name];
			bit.position.should.equal(bit2.position);
		}
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


