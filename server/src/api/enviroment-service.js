/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 10/31/17.
 */

var _ = require('lodash');

var JanuxEnvironmentService = require('janux-persist').EnvironmentService;
var Promise = require('bluebird');
var environmentServiceInstance = undefined;

var createInstance = function () {

	function EnvironmentService() {

	}

	EnvironmentService.prototype = Object.create(null);
	EnvironmentService.prototype.constructor = EnvironmentService;

	EnvironmentService.prototype.getEnvironmentInfo = function (callback) {
		return Promise.resolve(JanuxEnvironmentService.getEnvironmentInfo()).asCallback(callback);
	};

	return new EnvironmentService();
};

module.exports.create = function () {
	// if the instance does not exist, create it
	if (!_.isObject(environmentServiceInstance)) {
		// userServiceInstance = new UserService(aDAO);
		environmentServiceInstance = createInstance();
	}
	return environmentServiceInstance;
};
