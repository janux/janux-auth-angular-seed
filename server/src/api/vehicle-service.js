var _ = require('lodash');

var log4js = require('log4js'),
    log    = log4js.getLogger('vehicle-service');

var vehicleServiceInstance = undefined;
var vehicleServiceReferenceInstance = undefined;

var createInstance = function (vehicleServiceReference) {
	vehicleServiceReferenceInstance = vehicleServiceReference;


	function VehicleService() {

	}

	VehicleService.prototype = Object.create(null);
	VehicleService.prototype.constructor = VehicleService;

	VehicleService.prototype.findAll = function (callback) {
		log.debug("Call to findAll");
		return vehicleServiceReferenceInstance.findAll().asCallback(callback);
	};


	return new VehicleService();
};

module.exports.create = function (vehicleServiceReference) {
	// if the instance does not exist, create it
	if (!_.isObject(vehicleServiceInstance)) {
		// userServiceInstance = new UserService(aDAO);
		vehicleServiceInstance = createInstance(vehicleServiceReference);
	}
	return vehicleServiceInstance;
};