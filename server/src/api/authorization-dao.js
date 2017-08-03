'use strict';

//
// This DAO is designed to show how authorization contexts and roles are created
// directly in the code, can be injected into the authorization service but only
// provides functionality in read mode.
//

var	Promise  = require('bluebird'),
	_ = require('lodash'),
	util = require('util'),
	log4js = require('log4js'),
	AuthorizationContext = require('janux-authorize').AuthorizationContext,
	Role = require('janux-authorize').Role;

var log = log4js.getLogger('Auth DAO');

//  variable to hold the singleton instance, if used in that manner
var authDAOInstance = undefined;

function AuthDAO() {

	//
	// Defining the AuthorizationContexts programatically
	//
	this._authorizationContexts = {};

	this._standardPermissionBits = ['READ', 'UPDATE', 'CREATE', 'DELETE', 'PURGE'];

	//
	// Defining the Roles programmatically
	//
	this._roles = {};

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

	_.each(standardAuthContextSetup, (function(represents, name) {
		this._authorizationContexts[name] = AuthorizationContext.createInstance(
			name, 'Defines permissions available on a ' + represents,
			this._standardPermissionBits
		);
	}).bind(this));

	//
	// Define a non-standard 'GRANT' permission in the USER AuthorizationContext
	//
	this._authorizationContexts['USER'].addPermissionBit('GRANT', util.format('Grants permission to GRANT authorizations to Users in our system'));

	this._roles.WIDGET_DESIGNER = Role.createInstance('WIDGET_DESIGNER', 'A person who creates and edits widget information')
		.grant(['READ','UPDATE','CREATE','DELETE'], this._authorizationContexts.WIDGET)
	;

	// console.log('roles.WIDGET_DESIGNER:', JSON.stringify(roles.WIDGET_DESIGNER));

	this._roles.MANAGER = Role.createInstance('MANAGER', 'A Manager who can manage Widgets and Users')
		.grant(['READ','UPDATE','CREATE','DELETE'],         this._authorizationContexts.WIDGET)
		.grant(['READ','UPDATE','CREATE','DELETE','GRANT'], this._authorizationContexts.USER)
	;

	// console.log('roles.MANAGER:', JSON.stringify(roles.MANAGER));

	this._roles.SECURITY_MANAGER = Role.createInstance('SECURITY_MANAGER', 'A Person who can manage users and the authorization schema')
		.grant(['READ','UPDATE','CREATE','DELETE'],         this._authorizationContexts.AUTH_CONTEXT)
		.grant(['READ','UPDATE','CREATE','DELETE'],         this._authorizationContexts.ROLE)
		.grant(['READ','UPDATE','CREATE','DELETE','GRANT'], this._authorizationContexts.USER)
	;

	this._roles.ADMIN = Role.createInstance('ADMIN', 'Staff person with all privileges');
	this._roles.ADMIN.isAlmighty = true;
}

//
// Return a promise that resolves to and array of the standard permission bits
//
AuthDAO.prototype.loadPermissionBits = function(callback) {
	return new Promise( (function(resolve) {
		resolve( this._standardPermissionBits );
	}).bind(this) ).nodeify(callback);
};

//
// Returns a promise that resolves to a dictionary of the Authorization Contexts
// that make up the Authorization Scheme for an application. The keys of the map
// are the names of each AuthorizationContext.
//
AuthDAO.prototype.loadAuthorizationContexts = function(callback) {
	return new Promise( (function(resolve) {
		resolve( this._authorizationContexts );
	}).bind(this) ).nodeify(callback);
};

//
// Returns a promise that resolves to a single authorizationContext
//
AuthDAO.prototype.loadAuthorizationContextByName = function(name, callback) {
	return new Promise( (function(resolve) {
		resolve( this._authorizationContexts[name] );
	}).bind(this) ).nodeify(callback);
};

//
// Returns a promise that resolves to a dictionary of the Roles defined in the
// Authorization Scheme; the Roles include references to the Authorization
// Contexts in which they have been provided with permissions
//
AuthDAO.prototype.loadRoles = function(callback) {
	return new Promise( (function(resolve) {
		resolve( this._roles );
	}).bind(this) ).nodeify(callback);
};

//
// Returns a promise that resolves to a single Role
//
AuthDAO.prototype.loadRoleByName = function(name, callback) {
	return new Promise( (function(resolve) {
		resolve( this._roles[name] );
	}).bind(this) ).nodeify(callback);
};

// Returns a new instance
exports.createInstance = function() {
	return new AuthDAO();
};

// Returns the current stored instance (if it exists) or creates a new instance and stores
exports.singleton = function() {
	// if the singleton has not yet been instantiated, do so
	if ( !_.isObject(authDAOInstance) ) {
		authDAOInstance = new AuthDAO();
	}

	return authDAOInstance;
};

// Returns the object that has not yet been instantiated
exports.object = function() {
	return AuthDAO;
};