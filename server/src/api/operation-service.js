/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 10/31/17.
 */
var _ = require('lodash');
var OperationServiceImp = require('glarus-services').OperationServiceImpl;


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

	// Find and operation by id
	OperationService.prototype.findById = function (operationId, callback) {

		return operationServiceReference.findByIds([operationId]).asCallback(callback);
	};

	OperationService.prototype.findWithTimeEntriesByDateBetweenAndType = function (initDate, endDate, type, callback) {
		return operationServiceReference.findWithTimeEntriesByDateBetweenAndType(initDate, endDate, type).asCallback(callback);
	};

	OperationService.prototype.findWithTimeEntriesByDateAndPartyAndType = function (initDate, endDate, idParty, type, callback) {
		return operationServiceReference.findWithTimeEntriesByDateAndPartyAndType(initDate, endDate, idParty, type).asCallback(callback);
	};

	OperationService.prototype.findWithTimeEntriesByDateBetweenAndVendor = function (initDate, endDate, idVendor, callback) {
		return operationServiceReference.findWithTimeEntriesByDateBetweenAndVendor(initDate, endDate, idVendor).asCallback(callback);
	};

	OperationService.prototype.findAllWithoutTimeEntry = function (callback) {
		return operationServiceReference.findAll().asCallback(callback);
	};

	OperationService.prototype.findByType = function (type, callback) {
		return operationServiceReference.findByType(type).asCallback(callback);
	};


	// Insert an operation
	OperationService.prototype.insert = function (operation, callback) {

		var instance = OperationServiceImp.fromJSON(operation);

		return operationServiceReference.insert(instance).asCallback(callback);
	};

	// Update an operation
	OperationService.prototype.update = function (operation, callback) {

		var instance = OperationServiceImp.fromJSON(operation);

		return operationServiceReference.update(instance).asCallback(callback);
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