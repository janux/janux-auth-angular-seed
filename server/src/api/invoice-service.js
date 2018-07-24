/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 10/31/17.
 */
var _ = require('lodash');
var InvoiceServiceImpl = require('glarus-services').InvoiceServiceImpl;


var log4js = require('log4js'),
    log    = log4js.getLogger('operation-service');

var invoiceServiceInstance = undefined;
var invoiceServiceReferenceInstance = undefined;


var createInstance = function (invoiceServiceReference) {
	invoiceServiceReferenceInstance = invoiceServiceReference;


	function InvoiceService() {

	}

	InvoiceService.prototype = Object.create(null);
	InvoiceService.prototype.constructor = InvoiceService;

	InvoiceService.prototype.findByIdOperation = function (idOperation, callback) {
		return invoiceServiceReferenceInstance.findByIdOperation(idOperation).asCallback(callback);
	};

	InvoiceService.prototype.findByClient = function (idClient, callback) {
		return invoiceServiceReferenceInstance.findByClient(idClient).asCallback(callback);
	};

	InvoiceService.prototype.findInvoiceNumbersByIdTimeEntries = function (idTimeEntries, callback) {
		return invoiceServiceReferenceInstance.findInvoiceNumbersByIdTimeEntries(idTimeEntries).asCallback(callback);
	};

	InvoiceService.prototype.findOne = function (invoiceNumber, callback) {
		return invoiceServiceReferenceInstance.findOne(invoiceNumber).asCallback(callback);
	};

	InvoiceService.prototype.update = function (invoice, callback) {
		const object = InvoiceServiceImpl.fromJSON(invoice);
		return invoiceServiceReferenceInstance.update(object).asCallback(callback);
	};

	InvoiceService.prototype.insert = function (invoice, callback) {
		const object = InvoiceServiceImpl.fromJSON(invoice);
		return invoiceServiceReferenceInstance.insert(object).asCallback(callback);
	};

	InvoiceService.prototype.insertInvoiceItem = function (invoiceNumber, invoiceItem, callback) {
		const object = InvoiceServiceImpl.fromJSONInvoiceItem(invoiceItem);
		return invoiceServiceReferenceInstance.insertInvoiceItem(invoiceNumber, object).asCallback(callback);
	};

	InvoiceService.prototype.insertExpense = function (invoiceNumber, invoiceItemName, expense, callback) {
		const object = InvoiceServiceImpl.fromJSONExpense(expense);
		return invoiceServiceReferenceInstance.insertExpense(invoiceNumber, invoiceItemName, object).asCallback(callback);
	};

	InvoiceService.prototype.insertInvoiceItemTimeEntry = function (invoiceNumber, invoiceItemName, invoiceItemTE, callback) {
		const invoiceItemTEArray = _.map(invoiceItemTE, function (iITE) {
			return InvoiceServiceImpl.fromJSONItemTimeEntry(iITE);
		});
		return invoiceServiceReferenceInstance.insertInvoiceItemTimeEntry(invoiceNumber, invoiceItemName, invoiceItemTEArray).asCallback(callback);
	};

	InvoiceService.prototype.updateInvoiceItemTimeEntry = function (invoiceItemTE, callback) {
		const invoiceItemTEInstance = InvoiceServiceImpl.fromJSONItemTimeEntry(invoiceItemTE);
		return invoiceServiceReferenceInstance.updateInvoiceItemTimeEntry(invoiceItemTEInstance).asCallback(callback);
	};

	return new InvoiceService();
};

module.exports.create = function (invoiceServiceReference, userOperationServiceReference) {
	// if the instance does not exist, create it
	if (!_.isObject(invoiceServiceInstance)) {
		// userServiceInstance = new UserService(aDAO);
		invoiceServiceInstance = createInstance(invoiceServiceReference, userOperationServiceReference);
	}
	return invoiceServiceInstance;
};
