/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 12/11/17.
 */
var _ = require('lodash');
var moment = require('moment');


var log4js = require('log4js'),
	log    = log4js.getLogger('resource-service');

var resourceServiceInstance = undefined;
var resourceServiceReferenceInstance = undefined;

var createInstance = function (resourceServiceReference) {
	resourceServiceReferenceInstance = resourceServiceReference;


	function ResourceService() {

	}

	ResourceService.prototype = Object.create(null);
	ResourceService.prototype.constructor = ResourceService;

	ResourceService.prototype.findAvailableResources = function (callback) {
		log.debug("Call to findAvailableResources");
		return resourceServiceReferenceInstance.findAvailableResources().asCallback(callback);
	};


	return new ResourceService();
};

module.exports.create = function (resourceServiceReference) {
	// if the instance does not exist, create it
	if (!_.isObject(resourceServiceInstance)) {
		// userServiceInstance = new UserService(aDAO);
		resourceServiceInstance = createInstance(resourceServiceReference);
	}
	return resourceServiceInstance;
};