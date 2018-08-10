'use strict';

var _ = require('lodash');
var moment = require('moment');
var big = require('big.js');


module.exports =
	['$q', '$http', 'partyService', 'timeEntryService', 'dateUtilService', function ($q, $http, partyService, timeEntryService, dateUtilService) {

		function fromJSON(object) {
			const result = _.clone(object);
			result.client = partyService.fromJSON(object.client);
			result.discount = _.isNil(object.discount) ? undefined : Number(object.discount);
			result.discountPercentage = _.isNil(object.discountPercentage) ? undefined : Number(object.discountPercentage);
			result.grandTotal = _.isNil(object.grandTotal) ? undefined : Number(object.grandTotal);
			result.invoiceDate = dateUtilService.stringToDate(object.invoiceDate);
			result.items = _.isNil(object.items) ? [] : _.map(result.items, fromJSONItem);
			return result;
		}

		function fromJSONItem(object) {
			const result = _.clone(object);
			result.expenses = _.isNil(object.expenses) ? [] : _.map(object.expenses, fromJSONExpense);
			result.timeEntries = _.isNil(object.timeEntries) ? [] : _.map(object.timeEntries, fromJSONItemTimeEntry);
			return result;
		}

		function fromJSONExpense(object) {
			const result = _.clone(object);
			result.client = partyService.fromJSON(object.client);
			result.date = dateUtilService.stringToDate(object.date);
			result.person = partyService.fromJSON(object.person);
			result.cost = _.isNil(object.cost) ? undefined : Number(object.cost);
			return result;
		}

		function fromJSONItemTimeEntry(object) {
			const result = _.clone(object);
			result.timeEntry = timeEntryService.fromJSON(object.timeEntry);
			result.total = _.isNil(object.total) ? undefined : Number(object.total);
			return result;
		}


		function toJSON(object) {
			const result = _.clone(object);
			result.client = partyService.toJSON(object.client);
			result.items = _.map(object.items, toJSONItem);
			return result;
		}

		function toJSONItem(object) {
			const result = _.clone(object);
			result.expenses = _.map(object.expenses, toJSONExpense);
			result.timeEntries = _.map(object.timeEntries, toJSONItemTimeEntry);
			return result;
		}

		function toJSONExpense(object) {
			const result = _.clone(object);
			result.client = partyService.toJSON(object.client);
			result.person = partyService.toJSON(object.person);
			return result;
		}

		function toJSONItemTimeEntry(object) {
			const result = _.clone(object);
			result.timeEntry = timeEntryService.toJSON(object.timeEntry);
			return result;
		}


		var service = {
			fromJSON: function (object) {
				return fromJSON(object);
			},

			toJSON: function (object) {
				return toJSON(object);
			},

			findByClient: function (idClient) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'findByClient',
					[idClient]
				).then(function (resp) {
					return _.map(resp.data.result, fromJSON);
				});
			},

			findByUserName: function (username) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'findByUserName',
					[username]
				).then(function (resp) {
					return _.map(resp.data.result, fromJSON);
				});
			},

			findInvoiceNumbersByIdTimeEntries: function (idTimeEntries) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'findInvoiceNumbersByIdTimeEntries',
					[idTimeEntries]
				).then(function (resp) {
					return resp.data.result;
				});
			},

			findByIdOperation: function (idOperation) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'findByIdOperation',
					[idOperation]
				).then(function (resp) {
					return _.map(resp.data.result, fromJSON);
				});
			},

			findOne: function (invoiceNumber) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'findOne',
					[invoiceNumber]
				).then(function (resp) {
					return fromJSON(resp.data.result);
				});
			},

			update: function (invoice) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'update',
					[toJSON(invoice)]
				).then(function (resp) {
					return fromJSON(resp.data.result);
				});
			},

			insert: function (invoice) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'insert',
					[toJSON(invoice)]
				).then(function (resp) {
					return fromJSON(resp.data.result);
				});
			},

			insertInvoiceItem: function (invoiceNumber, invoiceItem) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'insertInvoiceItem',
					[invoiceNumber, toJSONItem(invoiceItem)]
				).then(function (resp) {
					return fromJSONItem(resp.data.result);
				});
			},

			insertInvoiceAndItem: function (invObj, invItemObj) {
				// Insert time entry
				return service.insert(invObj).then(function (insertedInvoice) {
					console.log('Inserted invoice', insertedInvoice);
					return service.insertInvoiceItem(invObj.invoiceNumber, invItemObj).then(function (insertedItem) {
						console.log('Inserted invoice item', insertedItem);
					});
				});
			},

			insertExpense: function (invoiceNumber, invoiceName, expense) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'insertExpense',
					[invoiceNumber, invoiceName, toJSONExpense(expense)]
				).then(function (resp) {
					return fromJSONExpense(resp.data.result);
				});
			},

			insertInvoiceItemTimeEntry: function (invoiceNumber, invoiceName, itemTimeEntry) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'insertInvoiceItemTimeEntry',
					[invoiceNumber, invoiceName, toJSONItemTimeEntry(itemTimeEntry)]
				).then(function (resp) {
					return fromJSONItemTimeEntry(resp.data.result);
				});
			},

			updateInvoiceItemTimeEntry: function (invoiceItemTE) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'updateInvoiceItemTimeEntry',
					[toJSONItemTimeEntry(invoiceItemTE)]
				).then(function (resp) {
					return fromJSONItemTimeEntry(resp.data.result);
				});
			},

			removeExpenses: function (expensesCodes) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'removeExpenses',
					[expensesCodes]
				).then(function (resp) {
					return resp.data.result;
				});
			}

		};
		return service;
	}];
