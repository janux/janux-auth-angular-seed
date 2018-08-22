'user strict';

var log4js           = require('log4js'),
    _                = require('underscore'),
    PartyServiceImpl = require('janux-persist').PartyServiceImpl,
	UserServiceDev 	 = require('./user-service.ext.dev'),
	UserServiceProd  = require('./user-service.ext.prod'),
	// env 		     = express().settings.env;
	env 			 = 'development',
    bluebird         = require('bluebird'),
	log = log4js.getLogger('UserService');

// variable to hold the singleton instance, if used in that manner
var userServiceInstance = undefined;
var userServicePersistence = undefined;
var commService = undefined;

//
// Example of user service
//

var createInstance = function (serviceReference, commServiceReference) {

	userServicePersistence = serviceReference;
	commService = commServiceReference;

	// TODO: Move method logic to janux-persist
	var UserServiceExt = (env === 'development') ? UserServiceDev : UserServiceProd;

	// Constructor
	function UserService(commService) {
		UserServiceExt.call(this, commService);
	}

	UserService.prototype = Object.create(UserServiceExt.prototype);
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

	return new UserService(commService);
};

module.exports.create = function (UserDAO, CommService) {
	// if the instance does not exist, create it
	if (!_.isObject(userServiceInstance)) {
		// userServiceInstance = new UserService(aDAO);
		userServiceInstance = createInstance(UserDAO, CommService);
	}
	return userServiceInstance;
};
