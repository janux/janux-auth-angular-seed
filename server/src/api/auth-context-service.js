'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var GroupImpl = require('janux-persist').GroupImpl;

var log4js      = require('log4js'),
	log         = log4js.getLogger('AuthContextService');

// variable to hold the singleton instance, if used in that manner
var authContextServiceInstance = undefined;
var authContextServicePersistence = undefined;
var authContextGroupServicePersistence = undefined;

var createInstance = function(authContextServiceReference,
							  authContextGroupServiceReference) {

	authContextServicePersistence = authContextServiceReference;
	authContextGroupServicePersistence = authContextGroupServiceReference;

	// Constructor
	function AuthContextService() {
		// authDAO.call(this);
	}

	AuthContextService.prototype = Object.create(null);
	AuthContextService.prototype.constructor = AuthContextService;

	//
	// Returns a promise that resolves to a dictionary of the AuthContextorization Contexts
	// that make up the AuthContextorization Scheme for an application. The keys of the map
	// are the names of each AuthContextorizationContext.
	//
	AuthContextService.prototype.findAll = function(callback) {

		return authContextServicePersistence.findAll().asCallback(callback);
	};


	//
	// Returns Array of the AuthContextorization Context Groups
	//
	AuthContextService.prototype.findGroups = function(callback) {

		return authContextGroupServicePersistence.findAll().asCallback(callback);
	};

	//
	// Returns a dictionary of the AuthContextorization Contexts within their respective groups
	//
	AuthContextService.prototype.findGroupsList = function(callback) {

		return authContextGroupServicePersistence.findGroupProperties().asCallback(callback);
	};

	//
	// Returns a promise that resolves to a single authorizationContext
	//
	AuthContextService.prototype.findOneByName = function(name, callback) {

		return authContextServicePersistence.findOneByName(name).then(function (result) {
			return result.toJSON();
		}).asCallback(callback);
	};

	//
	// Insert an authorization context in their respective group
	//
	AuthContextService.prototype.insert = function(authContextGroupCode, authContext, callback) {

		// Insert the AuthContextorization Context
		return authContextServicePersistence.insert(authContext)
			.then(function (insertedAuthContextContext) {
				// Add the authorization context reference to the corresponding group
				return authContextGroupServicePersistence.addItem(
					authContextGroupCode, insertedAuthContextContext
				).asCallback(callback);
			});
	};

	//
	// Insert an authorization context in their respective group
	//
	AuthContextService.prototype.update = function(name, groupCode, authContextObject, callback) {

		return authContextServicePersistence.findOneByName(name)
			.then(function (authContext) {
				// Ensure that only the name, description, and bit list fields are updated
				var authContextToUpdate = authContext.toJSON();

				authContextToUpdate.id = authContext.id;
				authContextToUpdate.name = authContextObject.name;
				authContextToUpdate.description = authContextObject.description;
				authContextToUpdate.bit = authContextObject.bit;
				authContextToUpdate.sortOrder = authContextObject.sortOrder;
				authContextToUpdate.enabled = authContextObject.enabled;

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
	// Update order of the authorization contexts
	//
	AuthContextService.prototype.updateSortOrder = function(authContextsOrder, callback) {

		return authContextServicePersistence.updateSortOrder(authContextsOrder).asCallback(callback);
	};

	//
	// Delete one AuthContextorization Context By Name, and delete the reference in the corresponding group
	//
	AuthContextService.prototype.deleteByName = function(groupCode, name, callback) {

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
	AuthContextService.prototype.insertGroup = function(groupObject, callback) {

		var group = new GroupImpl();
		group.name = groupObject.name;
		group.code = groupObject.code;
		group.description = groupObject.description;
		group.attributes = groupObject.attributes;
		group.values = [];

		// Insert the AuthContextorization Context Group
		return authContextGroupServicePersistence.insert(group).asCallback(callback);
	};

	//
	// Update one authorization context group
	//
	AuthContextService.prototype.updateGroup = function(code, groupObject, callback) {

		return authContextGroupServicePersistence.findOne(code).then(function (group) {
			group.name = groupObject.name;
			group.code = groupObject.code;
			group.description = groupObject.description;

			// Update the AuthContextorization Context Group
			return authContextGroupServicePersistence.update(group).asCallback(callback);
		});
	};

	//
	// Update order of authorization context groups
	//
	AuthContextService.prototype.updateGroupsSortOrder = function(groupsOrder, callback) {

		return authContextGroupServicePersistence.updateGroupsSortOrder(groupsOrder).asCallback(callback);
	};

	//
	// Load one authorization context group
	//
	AuthContextService.prototype.findGroupByCode = function(groupCode, callback) {

		return authContextGroupServicePersistence.findOne(groupCode).asCallback(callback);
	};

	//
	// Delete one authorization context group by code
	//
	AuthContextService.prototype.removeGroup = function(groupCode, callback) {

		// Remove the AuthContextorization Context Group
		return authContextGroupServicePersistence.remove(groupCode).asCallback(callback);
	};

	return new AuthContextService();
};

module.exports.create = function(authContextPersist, authContextGroupPersist){
	// if the instance does not exist, create it
	if ( !_.isObject(authContextServiceInstance) ) {
		// authContextServiceInstance = new AuthContextService(aDAO);
		authContextServiceInstance = createInstance(authContextPersist, authContextGroupPersist);
	}
	return authContextServiceInstance;
};
