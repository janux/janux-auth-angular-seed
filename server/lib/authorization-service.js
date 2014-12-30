'use strict';

var 
	_ = require('underscore')
	,AuthorizationContext = require('./PermissionContext')
	,Role = require('./Role')
	,util = require('util')
;

//
// authorizationContext is a public hashmap that stores the various Authorization
// Contexts that make up the authorization scheme for an application; it is
// spelled out in the singular so that it is more intuitive to read, for
// example:  AuthService.authorizationContext.WIDGET
//
var authorizationContext = exports.authorizationContext = {};


// private variable used to setup standard authorization contexts to be added
// further below via addStandardAuthorizationContext
var standardAuthContextSetup = {
	WIDGET:       'Widget that we want to track in our system',
	USER:         'User in our system',
	ROLE:         'Role in our system or business domain',
	AUTH_CONTEXT: 'Authorization Metadata for our system or business domain'
};

_.each(standardAuthContextSetup, function(represents, name) {
	addStandardAuthorizationContext(name, represents);
});


//
// Define a non-standard 'GRANT' permission to the USER Authorization context
//
authorizationContext.USER.addPermissionBit('GRANT', util.format('Grants permission to GRANT authorizations to Users in our system'));

// 
// role is a public hashmap that stores the various Roles
// that make up the authorization scheme for an application; it is
// spelled out in the singular so that it is more intuitive to read, for
// example:  AuthService.role.ADMIN
//
var role = exports.role = {};

/*
role.OWNER = Role.createInstance("OWNER", "The Owner of a Real Estate Property, the main end-customer")
	.grantPermissions(["READ","UPDATE"], authorizationContext.WIDGET)
	.grantPermissions(["READ","UPDATE","CREATE","DELETE"], authorizationContext.ROLE)
;
*/

role.WIDGET_DESIGNER = Role.createInstance('WIDGET_DESIGNER', 'A person who creates and edits widget information')
	.grantPermissions(['READ','UPDATE','CREATE','DELETE'], authorizationContext.WIDGET)
;

// console.log("role.OWNER:", JSON.stringify(role.OWNER));

/*
role.DEALER = Role.createInstance("DEALER", "A Dealer/Contractor who installs custom electronics at Properties")
	.grantPermissions(["READ","UPDATE","CREATE","DELETE"], authorizationContext.WIDGET)
	.grantPermissions(["READ","UPDATE","CREATE","DELETE"], authorizationContext.AUTH_CONTEXT)
;
*/

role.MANAGER = Role.createInstance('MANAGER', 'A Manager who can manage Widgets and Users')
	.grantPermissions(['READ','UPDATE','CREATE','DELETE'],         authorizationContext.WIDGET)
	.grantPermissions(['READ','UPDATE','CREATE','DELETE','GRANT'], authorizationContext.USER)
;

role.SECURITY_MANAGER = Role.createInstance('SECURITY_MANAGER', 'A Person who can manage users and the authorization schema')
	.grantPermissions(['READ','UPDATE','CREATE','DELETE'],         authorizationContext.AUTH_CONTEXT)
	.grantPermissions(['READ','UPDATE','CREATE','DELETE'],         authorizationContext.ROLE)
	.grantPermissions(['READ','UPDATE','CREATE','DELETE','GRANT'], authorizationContext.USER)
;

role.ADMIN = Role.createInstance("ADMIN", "Staff person with all privileges");
role.ADMIN.isAlmighty = true;

// console.log("role.ADMIN:", JSON.stringify(role.ADMIN));

//
// Given a Role, return a map of the permissionsContexts in this role has been
// granted permissions
//
exports.findAuthorizationContextsInRole = function findAuthorizationContextsInRole(role) {
	for (var key in role.permsGranted) {
		
	}
};



// 
// Private convenience method to add Authorization Context with standard permissions 
// (READ, UPDATE, CREATE, DELETE, PURGE) to the authorizationContext hashmap 
// of the Authorization Scheme
//
function addStandardAuthorizationContext(name, represents) {
	var authContext = AuthorizationContext.createInstance(name, "Defines permissions available on a " + represents);

	["READ", "UPDATE", "CREATE", "DELETE", "PURGE"].forEach( function(bitName) { 
		authContext.addPermissionBit(bitName, util.format('Grants permission to %s a %s', bitName, represents));
	});

	authorizationContext[name] = authContext;
}
