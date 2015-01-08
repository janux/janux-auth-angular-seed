(function(exports) {
	'use strict';

	// if we are being called from a node environment use require, 
	// otherwise expect dependency to be in context passed (namely the window object in a browser)
	var 
		inNode = (typeof module) === "object",
		_      = inNode ? require('underscore') : exports._
	;

	/**
	* meant to be an abstract object, that defines an interface, and provides
	* method implementations that can be copied to child object instances (objects
	* that need to implement the PermissionHolder interface)
	*/
	function PermissionHolder() {
	}

	Object.defineProperty(PermissionHolder.prototype, "typeName", {
		configurable: true, // allow implementing classes to change the typeName
		enumerable: true,
		value: "janux.security.PermissionHolder"
	});

	/**
	* Almighty PermissionHolders have all privileges, except those that are
	* explicitly denied; useful for specifying admin users that automatically get
	* assigned any new permissions created.
	*/
	Object.defineProperty(PermissionHolder.prototype, "isAlmighty", {
		enumerable: true
		,get: function() { return this._isAlmighty; }
		,set: function(bool) { this._isAlmighty = bool; }
	});

	/**
		* Given a PermissionContext and an array of strings representing multiple
		* permissions available in that context, this method grants those permissions
		* to this PermissionHolder entity. This method returns 'this' and may be chained.
		*
		* The permissions granted by this method replace any direct permissions that
		* the PermissionHolder may already have in this PermissionContext. 
		*
		* If you would like to remove all Permissions granted directly to this entity
		* within a Permission Context, pass an empty array.
		*/
	PermissionHolder.prototype.grantPermissions = function grantPermissions(perms, permContext) {
		if (!_.isObject(permContext) && permContext.typeName != "janux.security.PermissionContext") {
			throw new Error("You must pass a valid PermissionContext when granting permissions");
		}

		if (!_.isArray(perms) && !_.isNumber(perms)) {
			throw new Error("You must pass either a number or an array of string permissions when granting permissions");
		}

		var permsValue = _.isArray(perms) ? permContext.getPermissionsAsNumber(perms) : perms;
		this._permsGranted = this._permsGranted || {};

		if (permsValue > 0) {
			this._permsGranted[permContext.name] = {context: permContext, grant: permsValue};
		} else {
			this._permsGranted[permContext.name] = null;
		}
		return this;
	};

	/**
		* Boolean function called to determine whether this PermissionHolder holds a specific
		* permission within a PermissionContext, for example, assuming that a
		* PermissionContext 'PERSON' exists with permissions bits ["READ", "UPDATE"], 
		* calling hasPermission("READ", "PERSON") would return true if the
		* PermissionHolder has been granted the READ permission in this PermissionContext,
		* presumably, this would enable the PermissionHolder to view records associated with a
		* Person entity in an application
		*/
	PermissionHolder.prototype.hasPermission = function hasPermission(perm, context) {
		if (!_.isString(perm)) {
			throw new Error("hasPermission must be called with a string representing a permission name");
		}
		return this.hasPermissions([perm], context);
	};

	PermissionHolder.prototype.hasPermissions = function hasPermissions(perms, context) {
		if (!_.isArray(perms)) {
			throw new Error("hasPermissions must be called with an array of strings representing permission names");
		}
		// almighty users have all permissions for now (TODO: add 'deny' mechanism)
		if (this.isAlmighty) return true;

		var permsGranted = this._permsGranted[context];
		if (!_.isObject(permsGranted)) { return false; }

		var permContext = permsGranted.context;

		// console.log('permContext:', JSON.stringify(permContext));

		var requiredPerms = -1;
		try
		{ 
			requiredPerms = permContext.getPermissionsAsNumber(perms);
		}
		catch (e)
		{
			console.warn("WARNING: " + e );
			return false;
		}

		// console.log('requiredPerms:', requiredPerms);
		// console.log('permsGranted.grant:', permsGranted.grant);

		var match = permsGranted.grant & requiredPerms;
		// console.log("match is: ", match);

		return match == requiredPerms;
	};

	/**
	 * This is the preferred manner to check for permissions, as it is the most english-readable one,
	 * yielding a call such as:
	 *
	 * role.can("WRITE", DOCUMENT)
	 * or
	 * role.can(["UPDATE", "DELETE"], DOCUMENT)
	 *
	 * The first argument may be a string representing the permission, or an array of strings if
	 * checking for multiple permissions
	 */
	PermissionHolder.prototype.can = function can(perms, context) {
		if (_.isArray(perms)) {
			return this.hasPermissions(perms, context);
		} else if (_.isString(perms)) {
			return this.hasPermission(perms, context);
		} else {
			return false;
		}
	}


	PermissionHolder.prototype.toJSON = function toJSON() {
		var out = _.clone(this);
		delete out._permsGranted;
		delete out._isAlmighty;
		var perm;
		// outputs permissionsGranted separately from permissionsContexts to make json msg more readable
		// "permissions": {
		//   "PROPERTY":{"grant":3},
		//   "ACCOUNT":{"deny":7,}   // revokes inherited permissions, not yet implemented
		//   "EQUIPMENT":{"grant":3, "deny":4} // edge case, not yet implemented
		// }
		for (var key in this._permsGranted) {
			out.permissions = out.permissions || {};
			perm = this._permsGranted[key];
			out.permissions[key] = {};
			if (perm.grant) {out.permissions[key].grant = perm.grant;}
			if (perm.deny)  {out.permissions[key].deny  = perm.deny;}

			out.permissionContexts = out.permissionContexts || [];
			out.permissionContexts.push(perm.context.toJSON(true)); // true = doShortVersion
		}
		
		return out;
	};

	exports.createInstance = function createInstance() {
		var out = new PermissionHolder();
		// Object.defineProperties(out, out.spec());
		return out;
	};
})(typeof exports != "undefined" ? exports : window.PermissionHolder = {_: window._});
