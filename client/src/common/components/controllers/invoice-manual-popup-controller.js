'use strict';

var _ = require('lodash');

module.exports =
	['$scope', 'invoiceService', 'config', '$mdDialog', 'operation', function (
		$scope, invoiceService, config, $mdDialog, operation) {

		var invoiceItemName = 'Total';
		$scope.form = {
			invoiceNumber: '',
			invoiceDate  : undefined,
			grandTotal   : 0
		};

		$scope.cancel = function () {
			$mdDialog.cancel();
		};

		$scope.createNewInvoiceManual = function () {
			if (validateForm()) {
				var operationReference = _.cloneDeep(operation);
				// Given this operation object is an object associated to an ui
				// some attributes are dirty or altered. In this case we  fix it or get rid of them.
				// For the purpose to insert an invoice we can alter this object.
				operationReference.client = operationReference.client.object;
				operationReference.principals = [];
				operationReference.currentResources = [];
				operationReference.schedule = [];
				operationReference.interestedParty = null;
				var newInvoice = {
					client             : operationReference.client,
					invoiceNumber      : $scope.form.invoiceNumber,
					invoiceDate        : $scope.form.invoiceDate,
					comments           : '',
					items              : [],
					status             : config.invoice.status.inRevision,
					isPaid             : false,
					discount           : 0,
					discountPercentage : 0,
					totalBeforeExpenses: $scope.form.grandTotal,
					totalAfterExpenses : $scope.form.grandTotal,
					totalExpenses      : 0,
					grandTotal         : $scope.form.grandTotal,
					userDefinedValues  : true,
					defaultOperation   : operationReference
				};
				var newItem = {
					itemNumber : 1,
					name       : invoiceItemName,
					total      : 0,
					timeEntries: [],
					expenses   : []
				};
				invoiceService.insertPaid(newInvoice, newItem)
					.then(function () {
						$mdDialog.hide();
						// invoiceService.findByIdOperation(operationReference.id)
						// 	.then(function (result) {
						// 		$rootScope.$broadcast(config.invoice.events.invoiceListUpdated, result);
						// 		$mdDialog.hide();
						// 	});
					});
			}
		};

		function validateForm() {
			var result = true;
			return result;
		}
	}];
