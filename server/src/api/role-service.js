'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

var log4js      = require('log4js'),
	log         = log4js.getLogger('RoleService');

// variable to hold the singleton instance, if used in that manner
var roleServiceInstance = undefined;
var roleServicePersistence = undefined;

var createInstance = function(roleServiceReference) {

	roleServicePersistence = roleServiceReference;

	// Constructor
	function RoleService() {
		// roleDAO.call(this);
	}

	RoleService.prototype = Object.create(null);
	RoleService.prototype.constructor = RoleService;

	//
	// Returns a promise that resolves to a dictionary of the Roles defined in the
	// Authorization Scheme; the Roles include references to the Authorization
	// Contexts in which they have been provided with permissions
	//
	RoleService.prototype.findAll = function(callback) {

		return roleServicePersistence.findAll().asCallback(callback);
	};

	//
	// Returns a promise that resolves to a single Role
	//
	RoleService.prototype.findOneByName = function(name, callback) {

		return roleServicePersistence.findOneByName(name).asCallback(callback);
	};

	//
	// Insert a role
	//
	RoleService.prototype.insert = function(role, callback) {

		// Insert the Role
		return roleServicePersistence.insert(role).asCallback(callback);
	};

	//
	// Update a role
	//
	RoleService.prototype.update = function(name, roleObject, callback) {

		return roleServicePersistence.findOneByName(name)
			.then(function (role) {
				// Ensure that only the name, description, and bit list fields are updated
				var roleToUpdate = role.toJSON();

				roleToUpdate.id = role.id;
				roleToUpdate.name = roleObject.name;
				roleToUpdate.description = roleObject.description;
				roleToUpdate.enabled = roleObject.enabled;
				roleToUpdate.isAlmighty = roleObject.isAlmighty;
				roleToUpdate.sortOrder = roleObject.sortOrder;
				roleToUpdate.authContexts = roleObject.authContexts;
				roleToUpdate.permissions = roleObject.permissions;

				// log.info("Update role %j ",roleToUpdate);
				// Save the role
				return roleServicePersistence.update(roleToUpdate).asCallback(callback);
			});
	};

	//
	// Update order of the roles
	//
	RoleService.prototype.updateSortOrder = function(rolesOrder, callback) {

		return roleServicePersistence.updateSortOrder(rolesOrder).asCallback(callback);
	};

	//
	// Delete one role by name
	//
	RoleService.prototype.deleteByName = function(name, callback) {

		return roleServicePersistence.deleteByName(name).asCallback(callback);
	};

	return new RoleService();
};

module.exports.create = function(rolePersist){
	// if the instance does not exist, create it
	if ( !_.isObject(roleServiceInstance) ) {
		// roleServiceInstance = new RoleService(aDAO);
		roleServiceInstance = createInstance(rolePersist);
	}
	return roleServiceInstance;
};
