'user strict';

var log4js = require('log4js'),
	_      = require('underscore'),
	lodash = require('lodash'),
	log    = log4js.getLogger('UserService');

// variable to hold the singleton instance, if used in that manner
var userServiceInstance = undefined;
var userServicePersistence = undefined;
//
// Example of user service
//

var createInstance = function (serviceReference) {

	userServicePersistence = serviceReference;

	// Constructor
	function UserService() {
		//userDAO.call(this);
	}

	UserService.prototype = Object.create(null);
	UserService.prototype.constructor = UserService;

	//
	// Specific methods of user service
	//

	// Find records depending on a particular field
	UserService.prototype.findBy = function (field, search, callback) {
		log.info("Call to findBy with field: %j ,search: %j ", field, search);
		switch (field) {
			case 'username':
				return userServicePersistence.findAllByUserNameMatch(search).asCallback(callback);
				break;
			case 'name':
				return userServicePersistence.findAllByContactNameMatch(search).asCallback(callback);
				break;
			case 'email':
				return userServicePersistence.findAllByEmail(search).asCallback(callback);
				break;
			case 'phone':
				return userServicePersistence.findAllByPhone(search).asCallback(callback);
				break;
		}
	};

	UserService.prototype.findById = function (userId, callback) {
		return userServicePersistence.findOneByUserId(userId).asCallback(callback);
	};

	// Override the method to save users
	UserService.prototype.saveOrUpdate = function (aUserObj, callback) {


		//
		// If the user's role has been loaded, we ensure that only the name is stored back
		//
		// aUserObj.roles = _.map(aUserObj.roles, function (role) {
		//     return (typeof role.name !== 'undefined') ? role.name : role;
		// });
		//
		// return userDAO.prototype.saveOrUpdate.call(this, aUserObj).asCallback(callback);
		return userServicePersistence.saveOrUpdate(aUserObj).asCallback(callback);

	};

	UserService.prototype.deleteUser = function (userId, callback) {
		return userServicePersistence.deleteUserByUserId(userId).asCallback(callback);
	};


	UserService.prototype.deleteByUserIds = function (userIds, callback) {
		return userServicePersistence.deleteByUserIds(userIds).asCallback(callback);
	};

	return new UserService();
};

module.exports.create = function (UserDAO) {
	// if the instance does not exist, create it
	if (!_.isObject(userServiceInstance)) {
		// userServiceInstance = new UserService(aDAO);
		userServiceInstance = createInstance(UserDAO);
	}
	return userServiceInstance;
};
