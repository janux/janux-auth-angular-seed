'use strict';

var log4js = require('log4js'),
	_ = require('underscore'),
	log = log4js.getLogger('AuthService');

// variable to hold the singleton instance, if used in that manner
var authServiceInstance = undefined;

var createInstance = function(authDAO) {

	// Constructor
	function AuthService() {
		authDAO.call(this);
	}

	AuthService.prototype = Object.create(authDAO.prototype);
	AuthService.prototype.constructor = AuthService;

	//
	// Specific methods of auth service
	//

	return new AuthService();
};

module.exports.create = function(AuthDAO){
	// if the instance does not exist, create it
	if ( !_.isObject(authServiceInstance) ) {
		// authServiceInstance = new AuthService(aDAO);
		authServiceInstance = createInstance(AuthDAO);
	}
	return authServiceInstance;
};
