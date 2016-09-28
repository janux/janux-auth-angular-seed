'use strict';

var
	_ = require('underscore'),
	AuthorizationContext = require('janux-security').AuthorizationContext,
	Role = require('janux-security').Role,
	Q    = require('q'),
	util = require('util')
;

var authorizationContexts = {}, roles = {};


//
// Returns a promise that resolves to a dictionary of the Authorization Contexts
// that make up the Authorization Scheme for an application. The keys of the map
// are the names of each AuthorizationContext.
//
exports.loadAuthorizationContexts = function() {
	return Q(authorizationContexts);
}

//
// Returns a promise that resolves to a dictionary of the Roles defined in the
// Authorization Scheme; the Roles include references to the Authorization
// Contexts in which they have been provided with permissions
//
exports.loadRoles = function() {
	return Q(roles);
};

exports.loadRoleByName = function(name) {
	return Q(roles[name]);
};


//
// Defining the AuthorizationContexts programatically
//

//
// private variable used to setup standard authorization contexts to be added
// further below via addStandardAuthorizationContext
//
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
// Define a non-standard 'GRANT' permission in the USER AuthorizationContext
//
authorizationContexts['USER'].addPermissionBit('GRANT', util.format('Grants permission to GRANT authorizations to Users in our system'));

//
// Defining the Roles programmatically
//
roles.WIDGET_DESIGNER = Role.createInstance('WIDGET_DESIGNER', 'A person who creates and edits widget information')
	.grant(['READ','UPDATE','CREATE','DELETE'], authorizationContexts.WIDGET)
;

// console.log('roles.WIDGET_DESIGNER:', JSON.stringify(roles.WIDGET_DESIGNER));

roles.MANAGER = Role.createInstance('MANAGER', 'A Manager who can manage Widgets and Users')
	.grant(['READ','UPDATE','CREATE','DELETE'],         authorizationContexts.WIDGET)
	.grant(['READ','UPDATE','CREATE','DELETE','GRANT'], authorizationContexts.USER)
;

// console.log('roles.MANAGER:', JSON.stringify(roles.MANAGER));

roles.SECURITY_MANAGER = Role.createInstance('SECURITY_MANAGER', 'A Person who can manage users and the authorization schema')
	.grant(['READ','UPDATE','CREATE','DELETE'],         authorizationContexts.AUTH_CONTEXT)
	.grant(['READ','UPDATE','CREATE','DELETE'],         authorizationContexts.ROLE)
	.grant(['READ','UPDATE','CREATE','DELETE','GRANT'], authorizationContexts.USER)
;

roles.ADMIN = Role.createInstance('ADMIN', 'Staff person with all privileges');
roles.ADMIN.isAlmighty = true;

// console.log('roles.ADMIN:', JSON.stringify(roles.ADMIN));


//
// Private convenience method to add Authorization Context with standard permissions
// (READ, UPDATE, CREATE, DELETE, PURGE) to the authorizationContexts hashmap
// of the Authorization Scheme
//
// TODO: move this to the janux-security lib, as this would be a useful
// feature; we would need to find a way to easily override it so that library
// users can implement their own to suit their needs
//
function addStandardAuthorizationContext(name, represents) {
	var authContext = AuthorizationContext.createInstance(name, 'Defines permissions available on a ' + represents);

	['READ', 'UPDATE', 'CREATE', 'DELETE', 'PURGE'].forEach( function(bitName) {
		authContext.addPermissionBit(bitName, util.format('Grants permission to %s a %s', bitName, represents));
	});

	authorizationContexts[name] = authContext;
}
