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
var userOperationServiceReferenceInstance = undefined;

var createInstance = function (operationServiceReference, userOperationServiceReference) {
	operationServiceReferenceInstance = operationServiceReference;
	userOperationServiceReferenceInstance = userOperationServiceReference;


	function OperationService() {

	}

	OperationService.prototype = Object.create(null);
	OperationService.prototype.constructor = OperationService;

	// Find and operation by id
	OperationService.prototype.findById = function (operationId, callback) {

		return operationServiceReferenceInstance.findByIds([operationId]).asCallback(callback);
	};

	OperationService.prototype.findWithTimeEntriesByDateBetweenAndType = function (initDate, endDate, type, callback) {
		return operationServiceReferenceInstance.findWithTimeEntriesByDateBetweenAndType(initDate, endDate, type).asCallback(callback);
	};

	OperationService.prototype.findWithTimeEntriesByDateAndPartyAndType = function (initDate, endDate, idParty, type, callback) {
		return operationServiceReferenceInstance.findWithTimeEntriesByDateAndPartyAndType(initDate, endDate, idParty, type).asCallback(callback);
	};

	OperationService.prototype.findWithTimeEntriesByDateBetweenAndVendor = function (initDate, endDate, idVendor, callback) {
		return operationServiceReferenceInstance.findWithTimeEntriesByDateBetweenAndVendor(initDate, endDate, idVendor).asCallback(callback);
	};

	OperationService.prototype.findAllWithoutTimeEntry = function (callback) {
		return operationServiceReferenceInstance.findAll().asCallback(callback);
	};

	OperationService.prototype.findByType = function (type, callback) {
		return operationServiceReferenceInstance.findByType(type).asCallback(callback);
	};


	// Insert an operation
	OperationService.prototype.insert = function (operation, callback) {

		var instance = OperationServiceImp.fromJSON(operation);

		return operationServiceReferenceInstance.insert(instance).asCallback(callback);
	};

	// Update an operation
	OperationService.prototype.update = function (operation, callback) {

		var instance = OperationServiceImp.fromJSON(operation);

		return operationServiceReferenceInstance.update(instance).asCallback(callback);
	};

	// Methods where an username is required.

	OperationService.prototype.findWithTimeEntriesByDateBetweenAndUserAndType = function (initDate, endDate, username, type, callback) {
		return userOperationServiceReferenceInstance.findWithTimeEntriesByDateBetweenAndUserAndType(initDate, endDate, username, type).asCallback(callback);
	};

	OperationService.prototype.findWithoutTimeEntryByUsername = function (username, callback) {
		return userOperationServiceReferenceInstance.findWithoutTimeEntryByUsername(username).asCallback(callback);
	};

	return new OperationService();
};

module.exports.create = function (operationServiceReference, userOperationServiceReference) {
	// if the instance does not exist, create it
	if (!_.isObject(operationServiceInstance)) {
		// userServiceInstance = new UserService(aDAO);
		operationServiceInstance = createInstance(operationServiceReference, userOperationServiceReference);
	}
	return operationServiceInstance;
};