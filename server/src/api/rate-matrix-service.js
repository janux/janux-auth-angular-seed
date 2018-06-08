var log4js                = require('log4js'),
    _                     = require('lodash'),
    Promise               = require('bluebird'),
    RateMatrixServiceImpl = require('glarus-services').RateMatrixServiceImpl,
    log                   = log4js.getLogger('PartyService');

// variable to hold the singleton instance, if used in that manner
var rateMatrixServiceServiceInstance = undefined;
var rateMatrixServiceImpl = undefined;

var createInstance = function (serviceReference) {
	rateMatrixServiceImpl = serviceReference;

	function RateMatrixService() {

	}

	RateMatrixService.prototype = Object.create(null);
	RateMatrixService.prototype.constructor = RateMatrixService;

	RateMatrixService.prototype.findOrInsertDefaultRateMatrix= function (idClient, callback) {
		return rateMatrixServiceImpl.findOrInsertDefaultRateMatrix(idClient).asCallback(callback);
	};

	RateMatrixService.prototype.update = function (rateMatrix, callback) {
		var instance = RateMatrixServiceImpl.fromJSON(rateMatrix);
		return rateMatrixServiceImpl.update(instance).asCallback(callback);
	};

	return new RateMatrixService();
};


module.exports.create = function (PartyServiceImpl) {
	// if the instance does not exist, create it
	if (!_.isObject(rateMatrixServiceServiceInstance)) {
		rateMatrixServiceServiceInstance = createInstance(PartyServiceImpl);
	}
	return rateMatrixServiceServiceInstance;
};