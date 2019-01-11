/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 10/31/17.
 */
var _ = require('lodash');
var InvoiceServiceImpl = require('glarus-services').InvoiceService;


var log4js = require('log4js'),
    log    = log4js.getLogger('invoice-service');

var invoiceServiceInstance = undefined;
var invoiceServiceReferenceInstance = undefined;
var userInvoiceServiceReferenceInstance = undefined;


var createInstance = function (invoiceServiceReference, userInvoiceServiceReference) {
	invoiceServiceReferenceInstance = invoiceServiceReference;
	userInvoiceServiceReferenceInstance = userInvoiceServiceReference;

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

	InvoiceService.prototype.insertPaid = function (invoice, invoiceItem, callback) {
		const objectInvoice = InvoiceServiceImpl.fromJSON(invoice);
		const objectInvoiceItem = InvoiceServiceImpl.fromJSONInvoiceItem(invoiceItem);
		return invoiceServiceReferenceInstance.insertPaid(objectInvoice, objectInvoiceItem).asCallback(callback);
	};

	InvoiceService.prototype.insertInvoiceItem = function (invoiceNumber, invoiceItem, callback) {
		const object = InvoiceServiceImpl.fromJSONInvoiceItem(invoiceItem);
		return invoiceServiceReferenceInstance.insertInvoiceItem(invoiceNumber, object).asCallback(callback);
	};

	InvoiceService.prototype.insertInvoiceItemAllTimeEntries = function (invoiceNumber, invoiceItemName, idOperation, callback) {
		return invoiceServiceReferenceInstance.insertInvoiceItemAllTimeEntries(invoiceNumber, invoiceItemName, idOperation).asCallback(callback);
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

	InvoiceService.prototype.removeExpenses = function (expenseCodes, callback) {
		return invoiceServiceReferenceInstance.removeExpenses(expenseCodes).asCallback(callback);
	};

	InvoiceService.prototype.findByUserName = function (userName, callback) {
		return userInvoiceServiceReferenceInstance.findByUserName(userName).asCallback(callback);
	};

	return new InvoiceService();
};

module.exports.create = function (invoiceServiceReference, userInvoiceServiceReference) {
	// if the instance does not exist, create it
	if (!_.isObject(invoiceServiceInstance)) {
		// userServiceInstance = new UserService(aDAO);
		invoiceServiceInstance = createInstance(invoiceServiceReference, userInvoiceServiceReference);
	}
	return invoiceServiceInstance;
};
