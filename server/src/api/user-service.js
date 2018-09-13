'user strict';

var log4js = require('log4js'),
	_      = require('underscore'),
	Promise = require('bluebird');
	log    = log4js.getLogger('UserService'),
	util   = require('util');

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
		var promise;
		switch (field) {
			case 'username':
				promise = userServicePersistence.findAllByUserNameMatch(search);
				// return userServicePersistence.findAllByUserNameMatch(search).asCallback(callback);
				break;
			case 'name':
				promise = userServicePersistence.findAllByContactNameMatch(search);
				// return userServicePersistence.findAllByContactNameMatch(search).asCallback(callback);
				break;
			case 'email':
				promise = userServicePersistence.findAllByEmail(search);
				// return userServicePersistence.findAllByEmail(search).asCallback(callback);
				break;
			case 'phone':
				promise = userServicePersistence.findAllByPhone(search);
				// return userServicePersistence.findAllByPhone(search).asCallback(callback);
				break;
		}
		return promise
			.then(function (result) {
				var filteredResult = _.map(result, function (o) {
					return userServicePersistence.removeSensitiveData(o);
				});
				return Promise.resolve(filteredResult).asCallback(callback);
			})
	};

	UserService.prototype.findById = function (userId, callback) {
		return userServicePersistence.findOneByUserId(userId)
			.then(function (value) {
				var result = userServicePersistence.removeSensitiveData(value);
				return Promise.resolve(result).asCallback(callback);
			});
	};

	UserService.prototype.findOneByUsernameOrEmail = function (subject, callback) {
		var isEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		var promise;

		if (isEmail.test(subject)) {
			// findAllByEmail returns an array of user match, but since there isn't
			// duplicated emails on the system we can take first element as result
			promise = userServicePersistence.findAllByEmail(subject).then(function (result) {
				// log.info('findByEmail', result.length);
				if(result.length > 0) {
					log.info('findByEmail', result);
					return result[0];
				} else {
					var emailErr = util.format('User with email: "%s" does not exist', subject);
					log.info(emailErr);
					return Promise.reject(emailErr);
				}
			});
		} else {
			promise = userServicePersistence.findOneByUserName(subject);
		}

		return promise.then(function (value) {
			var result = userServicePersistence.removeSensitiveData(value);
			// log.info('Username found '+result);
			return Promise.resolve(result).asCallback(callback);
		}, function (err) {
			var msg = util.format('User with username/email: "%s" does not exist', subject);
			log.error(msg);
			callback(new Error(msg));
		})
			.catch(function (err) {
				throw new Error(err);
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
