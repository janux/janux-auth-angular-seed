'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var GroupImpl = require('janux-persist').GroupImpl;

var log4js      = require('log4js'),
	log         = log4js.getLogger('AuthService');

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
	// TODO: Temporary solution, instead of this method we need to implement the
	// templates to create authorization contexts
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
	// Returns Array of the Authorization Context Groups
	//
	AuthService.prototype.loadAuthorizationContextGroups = function(callback) {

		return authContextGroupServicePersistence.findAll().asCallback(callback);
	};

	//
	// Returns a dictionary of the Authorization Contexts within their respective groups
	//
	AuthService.prototype.loadAuthorizationContextGroupsList = function(callback) {

		return authContextGroupServicePersistence.findGroupProperties().asCallback(callback);
	};

	//
	// Returns a promise that resolves to a single authorizationContext
	//
	AuthService.prototype.loadAuthorizationContextByName = function(name, callback) {

		return authContextServicePersistence.findOneByName(name).then(function (result) {
			return result.toJSON();
		}).asCallback(callback);
	};

	//
	// Insert an authorization context in their respective group
	//
	AuthService.prototype.insertAuthorizationContext = function(authContextGroupCode, authContext, callback) {

		// Insert the Authorization Context
		return authContextServicePersistence.insert(authContext)
			.then(function (insertedAuthContext) {
				// Add the authorization context reference to the corresponding group
				return authContextGroupServicePersistence.addItem(
					authContextGroupCode, insertedAuthContext
				).asCallback(callback);
			});
	};

	//
	// Insert an authorization context in their respective group
	//
	AuthService.prototype.updateAuthorizationContext = function(name, groupCode, authContextObject, callback) {

		return authContextServicePersistence.findOneByName(name)
			.then(function (authContext) {
				// Ensure that only the name, description, and bit list fields are updated
				var authContextToUpdate = authContext.toJSON();

				authContextToUpdate.id = authContext.id;
				authContextToUpdate.name = authContextObject.name;
				authContextToUpdate.description = authContextObject.description;
				authContextToUpdate.bit = authContextObject.bit;

				log.info("Update auth context %j ",authContextToUpdate);

				// Ensure that the authorization context is in the correct group
				return authContextGroupServicePersistence.switchToNewGroup(authContextToUpdate, groupCode)
					.then(function () {
						// Save the authorization context
						return authContextServicePersistence.update(authContextToUpdate).asCallback(callback);
					});
			});
	};

	//
	// Delete one Authorization Context By Name, and delete the reference in the corresponding group
	//
	AuthService.prototype.deleteAuthorizationContextByName = function(groupCode, name, callback) {

		return authContextServicePersistence.findOneByName(name)
			.then(function (authContext) {
				return authContextGroupServicePersistence.removeItem(groupCode, authContext)
					.then(function () {
						return authContextServicePersistence.deleteByName(name).asCallback(callback);
					});
		});
	};

	//
	// Insert one authorization context group
	//
	AuthService.prototype.insertAuthorizationContextGroup = function(groupObject, callback) {

		var group = new GroupImpl();
		group.name = groupObject.name;
		group.code = groupObject.code;
		group.description = groupObject.description;
		group.attributes = {};
		group.values = [];

		// Insert the Authorization Context Group
		return authContextGroupServicePersistence.insert(group).asCallback(callback);
	};

	//
	// Update one authorization context group
	//
	AuthService.prototype.updateAuthorizationContextGroup = function(code, groupObject, callback) {

		return authContextGroupServicePersistence.findOne(code).then(function (group) {
			group.name = groupObject.name;
			group.code = groupObject.code;
			group.description = groupObject.description;

			// Update the Authorization Context Group
			return authContextGroupServicePersistence.update(group).asCallback(callback);
		});
	};

	//
	// Load one authorization context group
	//
	AuthService.prototype.loadAuthorizationContextGroup = function(groupCode, callback) {

		return authContextGroupServicePersistence.findOne(groupCode).asCallback(callback);
	};

	//
	// Insert one authorization context group
	//
	AuthService.prototype.insertAuthorizationContextGroup = function(groupObject, callback) {

		var group = new GroupImpl();
		group.name = groupObject.name;
		group.code = groupObject.code;
		group.description = groupObject.description;
		group.attributes = {};
		group.values = [];

		// Insert the Authorization Context Group
		return authContextGroupServicePersistence.insert(group).asCallback(callback);
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
