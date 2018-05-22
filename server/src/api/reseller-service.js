var log4js                = require('log4js'),
    _                     = require('lodash'),
    Promise               = require('bluebird'),
    log                   = log4js.getLogger('PartyService');

// variable to hold the singleton instance, if used in that manner
var resellerServiceServiceInstance = undefined;
var resellerServiceImpl = undefined;

var createInstance = function (serviceReference) {
	resellerServiceImpl = serviceReference;

	function ResellerService() {

	}

	ResellerService.prototype = Object.create(null);
	ResellerService.prototype.constructor = ResellerService;

	ResellerService.prototype.findResellerContactsByClient = function (idClient, callback) {
		return resellerServiceImpl.findResellerContactsByClient(idClient).asCallback(callback);
	};

	return new ResellerService();
};


module.exports.create = function (ResellerServiceImpl) {
	// if the instance does not exist, create it
	if (!_.isObject(resellerServiceServiceInstance)) {
		resellerServiceServiceInstance = createInstance(ResellerServiceImpl);
	}
	return resellerServiceServiceInstance;
};