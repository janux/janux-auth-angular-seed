(function(exports) {
	'use strict';

	// if we are being called from a node environment use require, 
	// otherwise expect dependency to be in context passed (namely the window object in a browser)
	var 
		inNode = typeof module === "object"
		,_ = inNode ? require('underscore') : exports._
		,sprintf = inNode ? require('sprintf-js').sprintf : exports.sprintf
	;

	function PermissionContext(aName, aDescription) {

		if (!_.isString(aName) || _.isEmpty(aName)) {
			throw new Error("Attempting to instantiate a PermissionContext without a name");
		}

		// public members without accessors
		this.name = aName;
		this.description = aDescription;

		//// private object that stores the private state of an instance
		var priv = {};

		priv.bit         = {}; // stores permission bits indexed by name
		priv.permBitList = []; // stores permission bits ordered by bit position

		/**
		* Defines read-only accessor 'bit' to map of permission bits map
		* This makes it possible to access an individual permission bit like, for example,
		*
		*   somePermContext.bit.READ
		*
		* or better yet, if all permission contexts are stored in a single map indexed by
		* their name, one could access a bit like: permissionContext.PERSON.bit.READ
		*/
		priv.spec = {
			bit: {
				enumerable: true
				,get: function() { return priv.bit;}
				,set: function() {} // do nothing
			}
		}

		this.spec = function spec() { return priv.spec; }

		//// privileged methods
		/**
		* Adds a PermissionBit to this PermissionContext, makes sure that there are no two PermissionBits
		* with the same name and that the value of PermissionBit.position is sequential and without
		* gaps
		*/
		this.addPermissionBit = function addPermissionBit(name, description, sortOrder) {

			if (!_.isString(name) || _.isEmpty(name)) {
				throw new Error( sprintf("Attempting to add a PermissionBit without a name to PermissionContext '%s'", this.name));
			}

			if (priv.bit[name]) {
				throw new Error( sprintf("A permission bit with name: '%s' already exists in PermissionContext '%s'", permBit.name, this.name));
			}

			var permBit = {};

			// make 'name' and 'position' fields immutable
			Object.defineProperties(permBit, {
				name:      { enumerable: true, value: name }
				,position: { enumerable: true, value: priv.permBitList.length } 
			});

			permBit.label = permBit.name; // mutable label that can be used instead of name for display purposes
			permBit.description = (_.isString(description) && !_.isEmpty(description)) ? description : "";
			permBit.sortOrder   = _.isNumber(sortOrder) ? sortOrder : permBit.position;  // default display order to bit position

			priv.permBitList[permBit.position] = permBit;
			
			// Add the permissionBit as an immutable object of the PermissionContext
			Object.defineProperty(priv.bit, permBit.name, {enumerable: true,  value: permBit});
		};

		/**
		* returns a clone of the PermissionBits as a list; adds to the memory
		* footprint, so use sparingly; you can also iterate over the
		* PermissionContext.bit map (object), which is indexed by bit name, 
		* as in permContext.bit.READ.
		*/
		this.getPermissionBitsAsList = function getPermissionBitsAsList() {
			return _.map(priv.permBitList, function(bit) { return _.clone(bit);});
		};

	}


	Object.defineProperty(PermissionContext.prototype, "typeName", {
		enumerable: true,
		value: "janux.security.PermissionContext"
	});

	/**
	* Converts the permission passed to a number, by calculating 2 to the power of
	* the bit position; for example, if the "CREATE" bit position is '3',
	* getPermissionAsNumber("CREATE") will return '8' (2 to the power of 3), or in
	* base-2 notation: '1000'
	*/
	PermissionContext.prototype.getPermissionAsNumber = function getPermissionAsNumber(permBitName) {
		if (!_.isString(permBitName)) {
			throw new Error ( "Argument to getPermissionAsNumber must be a string");
		}

		//var bit = this.getPermissionBit(permBitName);
		var bit = this.bit[permBitName];

		if (!_.isObject(bit)) {
			throw new Error ( sprintf("Cannot convert permission '%s' to number: it does not exist in PermissionContext '%s'", permBitName, this.name) );
		}

		return Math.pow(2,bit.position);
	};

	/**
	* Convenience method that converts a list of permissions specified by name to a
	* numeric representation, by calling getPermissionAsNumber for each permission,
	* and adding all the numbers thus returned.  For example, assuming that
	* getPermissionAsNumber("READ") returns 1, ad
	* getPermissionAsNumber("UPDATE") returns 2 (or '10' in base-2), and
	* getPermissionAsNumber("CREATE") returns 4 (or '100' in base-2)
	* then getPermissionsAsNumber(["READ","UPDATE","CREATE"]) would return 7 or 111
	* in base-2 notation.
	*/
	PermissionContext.prototype.getPermissionsAsNumber = function getPermissionsAsNumber(perms) {
		if (!_.isArray(perms)) {
			throw new Error ("Argument to getPermissionsAsNumber must be an array of strings");
		}

		var self = this;

		function sumPerms(out, perm) {
			return out + self.getPermissionAsNumber(perm);
		}

		return _.reduce(perms, sumPerms, 0);
	};

	/**
	* Passing the 'doShortVersion' boolean flag will return a barebones representation of the
	* PermissionContext; this is useful when serializing to JSON PermissionHolder entities (Role,
	* Account) that need to know about the PermissionContext metadata, but where it's desirable to keep
	* those JSON strings from being overly verbose.  The default JSON representation will return something
	* like:
	*
	* {"name":"PERSON",
	*   "description":"Defines permissions available on a Person entity",
	*   "typeName":"janux.security.PermissionContext",
	*   "bit":{
	*     "READ":{"position":0,"label":"READ","description":"Grants permission to READ a PERSON","sortOrder":0},
	*     "UPDATE":{"position":1,"label":"UPDATE","description":"Grants permission to UPDATE a PERSON","sortOrder":99}
	*   }
	* }
	*
	* whereas the short representation of the same PermissionContext would return:
	*
	* {"name":"PERSON",
	*   "bit":{
	*     "READ":{"position":0},
	*     "UPDATE":{"position":1}
	*   }
	* }
	*
	*/
	PermissionContext.prototype.toJSON = function toJSON(doShortVersion) {
		var out = {};
		out.name = this.name;

		if (!doShortVersion) {
			out.description = this.description;
			out.typeName = this.typeName;
		}

		for (var key in this.bit) {
			out.bit = out.bit || {};
			var aBit = {}
			aBit.position = this.bit[key].position

			if (!doShortVersion) {
				aBit.label = this.bit[key].label;
				aBit.description = this.bit[key].description;
				aBit.sortOrder = this.bit[key].sortOrder;
			}
			out.bit[key] = aBit;
		}

		return out;
	};

	/** creates an instance of a PermissionContext, name is a required field */
	exports.createInstance = function createInstance(aName, aDescription) {
		var out = new PermissionContext(aName, aDescription);
		Object.defineProperties(out, out.spec());
		delete out.spec; // delete accessor to private spec, so it cannot be tampered
		return out;
	};

	/** deserializes a PermissionContext from its canonical toJSON representation */
	exports.fromJSON = function fromJSON(obj) {
		var out = exports.createInstance(obj.name, obj.description);
		var bitlist = _.pairs(obj.bit);
		_.each(bitlist, function(tuple) { out.addPermissionBit(tuple[0], tuple[1].description, tuple[1].sortOrder); });
		return out;
	}

})(typeof exports != "undefined" ? exports : window.PermissionContext = {_:window._ , sprintf:window.sprintf});

