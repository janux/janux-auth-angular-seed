'use strict';

var _ = require('lodash');
var moment = require('moment');

module.exports =
	['$q', '$http', 'partyService', 'timeEntryService', 'dateUtilService', 'operationService', 'FileSaver', 'localStorageService', '$modal', '$filter', function ($q, $http, partyService, timeEntryService, dateUtilService, operationService, FileSaver, localStorageService, $modal, $filter) {


		const TIME_ENTRY_ASSOCIATED = "This time entry is already linked to another invoice";
		const ATTRIBUTE_INVOICE_NUMBER = "invoiceNumber";
		const MESSAGE_DUPLICATED = "There is another record with the same value";
		const MESSAGE_STATUS_ENDED = "Can't modify this invoice because the status is ended";

		function infoDialog(translateKey) {
			$modal.open({
				templateUrl: 'app/dialog-tpl/info-dialog.html',
				controller : ['$scope', '$modalInstance',
					function ($scope, $modalInstance) {
						$scope.message = $filter('translate')(translateKey);

						$scope.ok = function () {
							$modalInstance.close();
						};
					}],
				size       : 'md'
			});
		}

		function fromJSON(object) {
			const result = _.clone(object);
			result.client = partyService.fromJSON(object.client);
			result.discount = _.isNil(object.discount) ? undefined : Number(object.discount);
			result.discountPersonPercentage = _.isNil(object.discountPersonPercentage) ? 0 : Number(object.discountPersonPercentage);
			result.discountPercentage = _.isNil(object.discountPercentage) ? undefined : Number(object.discountPercentage);
			result.totalAfterExpenses = _.isNil(object.totalAfterExpenses) ? undefined : Number(object.totalAfterExpenses);
			result.totalExpenses = _.isNil(object.totalExpenses) ? undefined : Number(object.totalExpenses);
			result.totalBeforeExpenses = _.isNil(object.totalBeforeExpenses) ? undefined : Number(object.totalBeforeExpenses);
			result.totalPerson = _.isNil(object.totalPerson) ? undefined : Number(object.totalPerson);
			result.totalPersonAfterDiscount = _.isNil(object.totalPersonAfterDiscount) ? undefined : Number(object.totalPersonAfterDiscount);
			result.totalVehicle = _.isNil(object.totalVehicle) ? undefined : Number(object.totalVehicle);
			result.grandTotal = _.isNil(object.grandTotal) ? undefined : Number(object.grandTotal);
			result.invoiceDate = dateUtilService.stringToDate(object.invoiceDate);
			result.items = _.isNil(object.items) ? [] : _.map(result.items, fromJSONItem);
			result.defaultOperation = _.isNil(object.defaultOperation) ? undefined : operationService.fromJSON(object.defaultOperation);
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
			result.defaultOperation = _.isNil(object.defaultOperation) ? undefined : operationService.toJSON(object.defaultOperation);
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
			result.person = _.isNil(object.person) ? undefined : partyService.toJSON(object.person);
			return result;
		}

		function toJSONItemTimeEntry(object) {
			const result = _.clone(object);
			result.timeEntry = timeEntryService.toJSON(object.timeEntry);
			return result;
		}

		function handleError(errors) {
			const error = errors.data.error[0];
			if (error.attribute === ATTRIBUTE_INVOICE_NUMBER && error.message === MESSAGE_DUPLICATED) {
				infoDialog('services.invoice.dialogs.duplicatedInvoiceNumber');
			} else if (error.message === TIME_ENTRY_ASSOCIATED) {
				infoDialog('services.invoice.dialogs.insertTimeEntriesInvoiceError');
			} else if (error.attribute === ATTRIBUTE_INVOICE_NUMBER && error.message === MESSAGE_STATUS_ENDED) {
				infoDialog('services.invoice.dialogs.invoiceEnded');
			}
			return $q.reject(errors);
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
				}, function (err) {
					return handleError(err);
				});
			},

			insertPaid: function (invoice, invoiceItem) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'insertPaid',
					[toJSON(invoice), toJSONItem(invoiceItem)]
				).then(function (resp) {
					return fromJSON(resp.data.result);
				}, function (err) {
					return handleError(err);
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
				return service.insert(invObj)
					.then(function (insertedInvoice) {
						console.log('Inserted invoice', insertedInvoice);
						return service.insertInvoiceItem(invObj.invoiceNumber, invItemObj);
					}).then(function (insertedItem) {
						console.log('Inserted invoice item', insertedItem);
					}, function (err) {
						return handleError(err);
					});
			},

			insertExpense: function (invoiceNumber, invoiceName, expense) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'insertExpense',
					[invoiceNumber, invoiceName, toJSONExpense(expense)]
				).then(function (resp) {
					return fromJSONExpense(resp.data.result);
				}, function (err) {
					return handleError(err);
				});
			},

			insertInvoiceItemTimeEntry: function (invoiceNumber, invoiceName, itemTimeEntry) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'insertInvoiceItemTimeEntry',
					[invoiceNumber, invoiceName, toJSONItemTimeEntry(itemTimeEntry)]
				).then(function (resp) {
					return fromJSONItemTimeEntry(resp.data.result);
				}, function (err) {
					return handleError(err);
				});
			},

			insertInvoiceItemAllTimeEntries: function (invoiceNumber, invoiceName, idOperation) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'insertInvoiceItemAllTimeEntries',
					[invoiceNumber, invoiceName, idOperation]
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
				}, function (err) {
					return handleError(err);
				});
			},

			removeExpenses: function (expensesCodes) {
				return $http.jsonrpc(
					'/rpc/2.0/invoice',
					'removeExpenses',
					[expensesCodes]
				).then(function (resp) {
					return resp.data.result;
				}, function (err) {
					return handleError(err);
				});
			},

			mapTimeEntryDataAndInvoices: function (timeEntries, invoiceTimeEntryAssociation) {
				for (var i = 0; i < timeEntries.length; i++) {
					var timeEntry = timeEntries[i];
					timeEntry.invoiceInfo = _.find(invoiceTimeEntryAssociation, function (o) {
						return o.idTimeEntry === timeEntry.id;
					});
				}
				return timeEntries;
			},

			/**
			 * Generate the invoice report.
			 * @param invoiceNumber The invoice number.
			 * @param operation The operation associated to the invoice.
			 */
			specialOpsInvoiceReport: function (invoiceNumber, operation) {
				var now = moment();
				var invoiceFileName = 'anexo-factura-especiales' + now.format('YYYYMMDDHHmm') + '.xlsx';
				var headers = {
					'Content-type': 'application/json',
					'Accept'      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				};

				var token = localStorageService.get("token");
				var timeZone = dateUtilService.getBrowserTimeZone();

				if (_.isNil(token) === false) {
					headers['Authorization'] = 'Bearer ' + token
				}

				$http({
					url         : '/report/specialOpsInvoiceReport',
					method      : 'POST',
					responseType: 'arraybuffer',
					data        : {invoiceNumber: invoiceNumber, timeZone: timeZone},
					headers     : headers
				}).then(function (result) {

					var blob = new Blob([result.data], {
						type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					});
					// Define the name of
					if (!_.isNil(operation) && operation.type === 'SPECIAL_OPS') {
						var dateString = '';
						var clientName;
						var principalName = '';
						console.debug("Replacing name with operation %o", operation);
						if (_.isDate(operation.end)) {
							dateString = moment(operation.end).format('YYYYMMDD');
						}
						clientName = _.isString(operation.client.object.code) && operation.client.object.code !== '' ? operation.client.object.code : operation.client.object.name;
						if (_.isArray(operation.principals) && operation.principals.length > 0) {
							const principal = operation.principals[0];
							console.debug("Principal %o", principal);
							principalName = principal.object.name.first;
						}
						invoiceFileName = dateString + '.' + clientName + '-' + principalName + '.xlsx';
					}
					FileSaver.saveAs(blob, invoiceFileName);
				});
			}

		};
		return service;
	}];
