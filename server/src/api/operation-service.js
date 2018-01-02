/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 10/31/17.
 */
var _ = require('lodash');
var moment = require('moment');


var log4js = require('log4js'),
    log    = log4js.getLogger('operation-service');

var operationServiceInstance = undefined;
var operationServiceReferenceInstance = undefined;

var createInstance = function (operationServiceReference) {
	operationServiceReferenceInstance = operationServiceReference;


	function OperationService() {

	}

	OperationService.prototype = Object.create(null);
	OperationService.prototype.constructor = OperationService;

	// Returns all operations from glarus services.
	// For the moment. We are going to get the data given
	// a big date interval.
	// TODO: Improve find methods.
	OperationService.prototype.findAll = function (callback) {
		var initDate = new moment().subtract(10, 'years').toDate();
		var endDate = new moment().add(10, 'years').toDate();
		return operationServiceReference.findByDateBetweenWithTimeEntries(initDate, endDate).asCallback(callback);
	};

	OperationService.prototype.findByDateBetweenWithTimeEntries = function (initDate, endDate, callback) {
		return operationServiceReference.findByDateBetweenWithTimeEntries(initDate, endDate).asCallback(callback);
	};

	OperationService.prototype.findAllWithoutTimeEntry = function (callback) {
		return operationServiceReference.findAll().asCallback(callback);
	};

	return new OperationService();
};

module.exports.create = function (operationServiceReference) {
	// if the instance does not exist, create it
	if (!_.isObject(operationServiceInstance)) {
		// userServiceInstance = new UserService(aDAO);
		operationServiceInstance = createInstance(operationServiceReference);
	}
	return operationServiceInstance;
};