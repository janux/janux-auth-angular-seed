'user strict';

var log4js           = require('log4js'),
    _                = require('underscore'),
    PartyServiceImpl = require('janux-persist').PartyServiceImpl,
    bluebird         = require('bluebird');
log = log4js.getLogger('UserService');

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
	UserService.prototype.findBy = function (field, search, authenticatedUserName, callback) {
		log.info("Call to findBy with field: %j ,search: %j ", field, search);
		var promise;
		switch (field) {
			case 'username':
				promise = userServicePersistence.findAllByUserNameMatch(search, authenticatedUserName);
				// return userServicePersistence.findAllByUserNameMatch(search).asCallback(callback);
				break;
			case 'name':
				promise = userServicePersistence.findAllByContactNameMatch(search, authenticatedUserName);
				// return userServicePersistence.findAllByContactNameMatch(search).asCallback(callback);
				break;
			case 'email':
				promise = userServicePersistence.findAllByEmail(search, authenticatedUserName);
				// return userServicePersistence.findAllByEmail(search).asCallback(callback);
				break;
			case 'phone':
				promise = userServicePersistence.findAllByPhone(search, authenticatedUserName);
				// return userServicePersistence.findAllByPhone(search).asCallback(callback);
				break;
		}
		return promise
			.then(function (result) {
				var filteredResult = _.map(result, function (o) {
					return userServicePersistence.removeSensitiveData(o);
				});
				return bluebird.resolve(filteredResult).asCallback(callback);
			})
	};

	UserService.prototype.findById = function (userId, callback) {
		return userServicePersistence.findOneByUserId(userId)
			.then(function (value) {
				var result = userServicePersistence.removeSensitiveData(value);
				return bluebird.resolve(result).asCallback(callback);
			});
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

	UserService.prototype.findCompanyInfo = function (userName, callback) {
		return userServicePersistence.findCompanyInfo(userName)
			.then(function (result) {
				return PartyServiceImpl.toJSON(result);
			}).asCallback(callback);
	};

	UserService.prototype.deleteUser = function (userId, callback) {
		return userServicePersistence.deleteUserByUserId(userId).asCallback(callback);
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
