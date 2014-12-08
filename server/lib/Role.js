(function(exports) {
	'use strict';
	
	// if we are being called from a node environment use require, 
	// otherwise expect dependency to be in context passed (namely the window object in a browser)
	var 
		inNode = typeof module === "object"
		,_ = inNode ? require('underscore') : exports._
		,sprintf = inNode ? require('sprintf-js').sprintf : exports.sprintf
		,PermissionHolder  = inNode ? require('./PermissionHolder')  : exports.PermissionHolder
		,PermissionContext = inNode ? require('./PermissionContext') : exports.PermissionContext

	function Role(aName, aDescription) {
		
		if (!_.isString(aName) || _.isEmpty(aName)) {
			throw new Error("Attempting to instantiate a Role without a name");
		}

		// public members without accessors
		this.name        = aName;
		this.description = aDescription;
		this.sortOrder   = 0;
		this.isEnabled   = true;

		// private member
		this._permsGranted = {};
	}

	Role.prototype = PermissionHolder.createInstance();

	// static, immutable 
	Object.defineProperty(Role.prototype, "typeName", {
		enumerable: true,
		value: "janux.security.Role"
	});


	exports.createInstance = function createInstance(aName, aDescription) {
		var out = new Role(aName, aDescription);

		// Object.defineProperties(out, out.spec());
		return out;
	};

	/** static method that deserializes a Role from its canonical toJSON representation */
	exports.fromJSON = function fromJSON(obj) {
		var out = exports.createInstance(obj.name, obj.description);
		out.sortOrder = obj.sortOrder;
		_.each(obj.permissionContexts, function(permContext) {
			out.grantPermissions(obj.permissions[permContext.name].grant, PermissionContext.fromJSON(permContext));
		});
		if (obj.isAlmighty) out.isAlmighty = true;

		return out;
	}

})(typeof exports != "undefined" ?  exports : window.Role = {
	_: window._  
	,sprintf: window.sprintf 
	,PermissionHolder:  window.PermissionHolder
	,PermissionContext: window.PermissionContext
});
