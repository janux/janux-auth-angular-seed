/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 12/11/17.
 */
var _ = require('lodash');
var moment = require('moment');


var log4js = require('log4js'),
    log    = log4js.getLogger('resource-service');

var ResourceServiceImplClass = require('glarus-services').ResourceService;

var resourceServiceInstance = undefined;
var resourceServiceReferenceInstance = undefined;

var createInstance = function (resourceServiceReference) {
	resourceServiceReferenceInstance = resourceServiceReference;


	function ResourceService() {

	}

	ResourceService.prototype = Object.create(null);
	ResourceService.prototype.constructor = ResourceService;

	ResourceService.prototype.findAvailableResources = function (functions, callback) {
		log.debug("Call to findAvailableResources with functions " + JSON.stringify(functions));
		return resourceServiceReferenceInstance.findAvailableResources(functions).asCallback(callback);
	};

	ResourceService.prototype.findAvailableResourcesByVendor = function (idVendor, callback) {
		log.debug("Call to findAvailableResourcesByVendor with idVendor %j", idVendor)
		return resourceServiceReferenceInstance.findAvailableResourcesByVendor(idVendor).asCallback(callback);
	};


	ResourceService.prototype.removeByIdsWithValidation = function (ids, callback) {
		log.debug("Call to removeByIdsWithValidation  with ids: %j ", ids);
		return resourceServiceReferenceInstance.removeByIdsWithValidation(ids).asCallback(callback);
	};

	ResourceService.prototype.insertMany = function (resources, callback) {
		log.debug("Call to insertMany with resources %j", resources);
		var resourcesInstances = _.map(resources, function (o) {
			return ResourceServiceImplClass.fromJSON(o);
		});
		return resourceServiceReferenceInstance.insertMany(resourcesInstances).asCallback(callback);
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
