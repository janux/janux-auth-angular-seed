'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

// variable to hold the singleton instance, if used in that manner
var authServiceInstance = undefined;
var authContextServicePersistence = undefined;
var authContextGroupServicePersistence = undefined;
var roleServicePersistence = undefined;

var createInstance = function(authContextServiceReference,
							  authContextGroupServiceReference,
							  roleServiceReference) {

	authContextServicePersistence = authContextServiceReference;
	authContextGroupServicePersistence = authContextGroupServiceReference;
	roleServicePersistence = roleServiceReference;

	// Constructor
	function AuthService() {
		// authDAO.call(this);
	}

	AuthService.prototype = Object.create(null);
	AuthService.prototype.constructor = AuthService;

	//
	// Return a promise that resolves to and array of the standard permission bits
	//
	AuthService.prototype.loadPermissionBits = function(callback) {

		return Promise.resolve(['READ', 'UPDATE', 'CREATE', 'DELETE', 'PURGE']).asCallback(callback);
	};

	//
	// Returns a promise that resolves to a dictionary of the Authorization Contexts
	// that make up the Authorization Scheme for an application. The keys of the map
	// are the names of each AuthorizationContext.
	//
	AuthService.prototype.loadAuthorizationContexts = function(callback) {

		return authContextServicePersistence.findAll().asCallback(callback);
	};


	//
	// Returns a dictionary of the Authorization Contexts within their respective groups
	//
	AuthService.prototype.loadAuthorizationContextGroups = function(callback) {

		return authContextGroupServicePersistence.findAll().asCallback(callback);
	};

	//
	// Returns a promise that resolves to a single authorizationContext
	//
	AuthService.prototype.loadAuthorizationContextByName = function(name, callback) {

		return authContextServicePersistence.findOneByName(name).asCallback(callback);
	};

	//
	// Returns a promise that resolves to a dictionary of the Roles defined in the
	// Authorization Scheme; the Roles include references to the Authorization
	// Contexts in which they have been provided with permissions
	//
	AuthService.prototype.loadRoles = function(callback) {

		return roleServicePersistence.findAll().asCallback(callback);
	};

	//
	// Returns a promise that resolves to a single Role
	//
	AuthService.prototype.loadRoleByName = function(name, callback) {

		return roleServicePersistence.findOneByName(name).asCallback(callback);
	};

	return new AuthService();
};

module.exports.create = function(authContextPersist, authContextGroupPersist, rolePersist){
	// if the instance does not exist, create it
	if ( !_.isObject(authServiceInstance) ) {
		// authServiceInstance = new AuthService(aDAO);
		authServiceInstance = createInstance(authContextPersist, authContextGroupPersist, rolePersist);
	}
	return authServiceInstance;
};
