'use strict';

var 
	_ = require('underscore')
	,PermissionContext = require('./PermissionContext')
	,Role = require('./Role')
	,util = require('util')
;

// 
// permissionContext is a public hashmap that stores the various Permission
// Contexts that make up the authorization scheme for an application; it is
// spelled out in the singular so that it is more intuitive to read, for
// example:  AuthService.permissionContext.EQUIPMENT
//
var permissionContext = exports.permissionContext = {};

// private variable used to setup standard permission contexts to be added
// further below via addStandardPermissionContext
var standardPermContextSetup = {
	PROPERTY: "Master Record of a Real Estate Property"
	,EQUIPMENT:  "Equipment at a Property"
};

_.each(standardPermContextSetup, function(represents, name) {
	addStandardPermissionContext(name, represents);
});


// 
// role is a public hashmap that stores the various Roles
// that make up the authorization scheme for an application; it is
// spelled out in the singular so that it is more intuitive to read, for
// example:  AuthService.role.ADMIN
//
var role = exports.role = {};

role.OWNER = Role.createInstance("OWNER", "The Owner of a Real Estate Property, the main end-customer")
	.grantPermissions(["READ","UPDATE"], permissionContext.PROPERTY)
	.grantPermissions(["READ","UPDATE","CREATE","TRASH"], permissionContext.EQUIPMENT)
;

// console.log("role.OWNER:", JSON.stringify(role.OWNER));

role.DEALER = Role.createInstance("DEALER", "A Dealer/Contractor who installs custom electronics at Properties")
	.grantPermissions(["READ","UPDATE","CREATE","TRASH"], permissionContext.PROPERTY)
	.grantPermissions(["READ","UPDATE","CREATE","TRASH"], permissionContext.EQUIPMENT)
;

role.ADMIN = Role.createInstance("ADMIN", "Jetson Systems Staff with all privileges");
role.ADMIN.isAlmighty = true;

// console.log("role.ADMIN:", JSON.stringify(role.ADMIN));

//
// Given a Role, return a map of the permissionsContexts in this role has been
// granted permissions
//
exports.findPermissionContextsInRole = function findPermissionContextsInRole(role) {
	for (var key in role.permsGranted) {
		
	}
};



// 
// Private convenience method to add Permission Context with standard permissions 
// (READ, UPDATE, CREATE, TRASH, DELETE) to the permissionContext hashmap 
// of the Authorization Scheme
//
function addStandardPermissionContext(name, represents) {
	var permContext = PermissionContext.createInstance(name, "Defines permissions available on a " + represents);

	["READ", "UPDATE", "CREATE", "TRASH", "DELETE"].forEach( function(bitName) { 
		permContext.addPermissionBit(bitName, util.format('Grants permission to %s a %s', bitName, represents));
	});

	permissionContext[name] = permContext;
}
